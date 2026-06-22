import { NextResponse } from 'next/server';
import { MatchEvent, MatchStatistic } from '@/types';

let eventCache: Record<number, { timestamp: number; data: any }> = {};
const CACHE_TTL_MS = 60000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('id');

  if (!fixtureId) {
    return NextResponse.json({ error: 'Missing fixture id' }, { status: 400 });
  }

  const id = parseInt(fixtureId);
  const now = Date.now();

  if (eventCache[id] && now - eventCache[id].timestamp < CACHE_TTL_MS) {
    return NextResponse.json(eventCache[id].data);
  }

  const apiKey = process.env.WORLD_CUP_API_KEY;
  if (!apiKey || apiKey.startsWith('mock_key')) {
    return NextResponse.json({ events: [], statistics: [], substitutions: [] });
  }

  try {
    const [eventsRes, statsRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${id}`, {
        headers: { 'x-apisports-key': apiKey },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${id}`, {
        headers: { 'x-apisports-key': apiKey },
      }),
    ]);

    const [eventsData, statsData] = await Promise.all([
      eventsRes.ok ? eventsRes.json() : null,
      statsRes.ok ? statsRes.json() : null,
    ]);

    // We need to figure out home team ID — fetch fixture info
    const fixtureRes = await fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
      headers: { 'x-apisports-key': apiKey },
    });
    const fixtureData = fixtureRes.ok ? await fixtureRes.json() : null;
    const homeTeamId = fixtureData?.response?.[0]?.teams?.home?.id;

    const events: MatchEvent[] = [];
    const substitutions: { minute: number; team: 'home' | 'away'; playerIn: string; playerOut: string }[] = [];

    if (eventsData?.response) {
      for (const ev of eventsData.response) {
        const side: 'home' | 'away' = ev.team.id === homeTeamId ? 'home' : 'away';
        const evType = ev.type?.toLowerCase() ?? '';
        const detail = ev.detail?.toLowerCase() ?? '';

        if (evType === 'goal' || detail.includes('goal')) {
          events.push({ minute: ev.time.elapsed ?? 0, team: side, type: 'goal', player: ev.player?.name ?? '?', assist: ev.assist?.name || undefined });
        } else if (evType === 'card' && detail.includes('red')) {
          events.push({ minute: ev.time.elapsed ?? 0, team: side, type: 'red-card', player: ev.player?.name ?? '?' });
        } else if (evType === 'card' && detail.includes('yellow')) {
          events.push({ minute: ev.time.elapsed ?? 0, team: side, type: 'yellow-card', player: ev.player?.name ?? '?' });
        } else if (evType === 'subst') {
          substitutions.push({ minute: ev.time.elapsed ?? 0, team: side, playerIn: ev.assist?.name ?? '?', playerOut: ev.player?.name ?? '?' });
        }
      }
    }

    const statistics: MatchStatistic[] = [];
    if (statsData?.response && statsData.response.length >= 2) {
      const homeStats = statsData.response[0]?.statistics ?? [];
      const awayStats = statsData.response[1]?.statistics ?? [];
      const wantedStats = ['Ball Possession', 'Shots on Goal', 'Total Shots', 'Fouls', 'Corner Kicks'];
      for (const label of wantedStats) {
        const hStat = homeStats.find((s: any) => s.type === label);
        const aStat = awayStats.find((s: any) => s.type === label);
        if (hStat && aStat) {
          statistics.push({
            label: label === 'Ball Possession' ? 'Possession' : label === 'Shots on Goal' ? 'Shots on Target' : label,
            home: parseInt(String(hStat.value ?? '0').replace('%', '')) || 0,
            away: parseInt(String(aStat.value ?? '0').replace('%', '')) || 0,
          });
        }
      }
    }

    const payload = { events, statistics, substitutions };
    eventCache[id] = { timestamp: now, data: payload };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error(`[Match Events API Error]:`, error);
    return NextResponse.json({ events: [], statistics: [], substitutions: [] });
  }
}

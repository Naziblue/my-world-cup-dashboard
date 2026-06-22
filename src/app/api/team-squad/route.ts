import { NextResponse } from 'next/server';
import { SquadPlayer, Coach, TeamSquadData } from '@/types';

let squadCache: Record<number, { timestamp: number; data: TeamSquadData }> = {};
const CACHE_TTL_MS = 3600000; // 1 hour — squads don't change mid-tournament

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('id');

  if (!teamId) {
    return NextResponse.json({ error: 'Missing team id' }, { status: 400 });
  }

  const id = parseInt(teamId);
  const now = Date.now();

  if (squadCache[id] && now - squadCache[id].timestamp < CACHE_TTL_MS) {
    return NextResponse.json(squadCache[id].data);
  }

  const apiKey = process.env.WORLD_CUP_API_KEY;
  if (!apiKey || apiKey.startsWith('mock_key')) {
    return NextResponse.json({ coach: null, players: [] } as TeamSquadData);
  }

  try {
    const [squadRes, coachRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/players/squads?team=${id}`, {
        headers: { 'x-apisports-key': apiKey },
      }),
      fetch(`https://v3.football.api-sports.io/coachs?team=${id}`, {
        headers: { 'x-apisports-key': apiKey },
      }),
    ]);

    const [squadData, coachData] = await Promise.all([
      squadRes.ok ? squadRes.json() : null,
      coachRes.ok ? coachRes.json() : null,
    ]);

    const players: SquadPlayer[] = [];
    if (squadData?.response?.[0]?.players) {
      for (const p of squadData.response[0].players) {
        players.push({
          name: p.name ?? '?',
          age: p.age ?? null,
          number: p.number ?? null,
          position: p.position ?? 'Unknown',
          photo: p.photo ?? '',
        });
      }
    }

    let coach: Coach | null = null;
    if (coachData?.response?.length > 0) {
      const activeCoach = coachData.response.find((c: any) =>
        c.career?.some((car: any) => car.team?.id === id && car.end === null)
      ) ?? coachData.response[0];

      if (activeCoach) {
        coach = {
          name: activeCoach.name ?? '?',
          photo: activeCoach.photo ?? '',
          nationality: activeCoach.nationality ?? '',
        };
      }
    }

    const payload: TeamSquadData = { coach, players };
    squadCache[id] = { timestamp: now, data: payload };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error(`[Team Squad API Error]:`, error);
    return NextResponse.json({ coach: null, players: [] } as TeamSquadData);
  }
}

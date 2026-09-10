import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const events = data?.events;

    if (!Array.isArray(events) || events.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    // In production: forward batch to ClickHouse, Kafka, Tinybird, or Datadog
    for (const evt of events) {
      console.log(
        `[Telemetry Ingest] [${evt.eventType}] uid=${evt.userId} cohort=${evt.cohort} cur=${evt.currency}`
      );
    }

    // Return 204 No Content for minimum network bandwidth
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
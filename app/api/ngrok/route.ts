import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'ngrok not running',
        message: 'Could not connect to ngrok API. Make sure ngrok is running.'
      }, { status: 404 });
    }

    const data = await response.json();
    
    if (!data.tunnels || data.tunnels.length === 0) {
      return NextResponse.json({ 
        error: 'No tunnels found',
        message: 'ngrok is running but no tunnels are active.'
      }, { status: 404 });
    }

    const httpsTunnel = data.tunnels.find((t: any) => t.proto === 'https');
    const tunnel = httpsTunnel || data.tunnels[0];

    return NextResponse.json({
      url: tunnel.public_url,
      name: tunnel.name,
      proto: tunnel.proto
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'ngrok not running',
      message: 'ngrok is not running or not accessible at http://127.0.0.1:4040'
    }, { status: 503 });
  }
}

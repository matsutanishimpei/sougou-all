interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json<{ code: string }>();
    const { code } = body;

    // Cloudflare Pages の管理画面で設定する環境変数から取得します。
    // 設定されていない場合はローカル時のデフォルトフォールバックを使用します。
    const clientId = context.env.GITHUB_CLIENT_ID || 'Ov23liFWupK3e2e4v6IF';
    const clientSecret = context.env.GITHUB_CLIENT_SECRET;

    if (!clientSecret) {
      return new Response(
        JSON.stringify({ error: 'GITHUB_CLIENT_SECRET is not configured in Cloudflare environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'cloudflare-pages-function'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error during token exchange' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

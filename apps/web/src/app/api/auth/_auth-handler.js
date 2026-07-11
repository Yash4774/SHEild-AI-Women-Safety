import { Auth, setEnvDefaults } from "@auth/core";
import { authConfig } from "@/auth";

const AUTH_BASE_PATH = "/api/auth";

function withForwardedHost(request) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  const forwardedProto = headers.get("x-forwarded-proto");
  const forwardedHost = headers.get("x-forwarded-host") ?? headers.get("host");

  if (forwardedProto) {
    url.protocol = forwardedProto.endsWith(":")
      ? forwardedProto
      : `${forwardedProto}:`;
  }

  if (forwardedHost) {
    url.host = forwardedHost;
    headers.set("host", forwardedHost);
    headers.delete("x-forwarded-host");
  }

  const init = {
    cache: request.cache,
    credentials: request.credentials,
    headers,
    integrity: request.integrity,
    keepalive: request.keepalive,
    method: request.method,
    mode: request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    signal: request.signal,
  };

  if (request.body) {
    init.body = request.body;
    init.duplex = "half";
  }

  return new Request(url.href, init);
}

export async function handleAuth(request) {
  const config = {
    ...authConfig,
    basePath: AUTH_BASE_PATH,
    secret: authConfig.secret ?? process.env.AUTH_SECRET,
  };

  setEnvDefaults(process.env, config);

  return Auth(withForwardedHost(request), config);
}


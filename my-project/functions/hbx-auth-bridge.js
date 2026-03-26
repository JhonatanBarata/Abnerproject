const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

if (!admin.apps.length) {
  admin.initializeApp();
}

const DEFAULT_HBX_API_URL = "https://hbx-1.onrender.com";
const DEFAULT_ADMIN_UID = "hbx-website-admin";
const FUNCTION_SERVICE_ACCOUNT = "guinchorioclarosp@appspot.gserviceaccount.com";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function setCorsHeaders(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function handleOptions(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      logger.error("Nao foi possivel interpretar o corpo da requisicao HBX.", error);
    }
  }

  return {};
}

function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

function getHbxVerifyUrl() {
  const apiBaseUrl = sanitizeText(process.env.HBX_API_URL, DEFAULT_HBX_API_URL).replace(/\/+$/, "");
  return `${apiBaseUrl}/website/admin/verify`;
}

async function verifyHbxSession(sessionToken) {
  const response = await fetch(getHbxVerifyUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    cache: "no-store",
    body: JSON.stringify({ sessionToken })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw createHttpError(response.status, data.error || data.message || "Falha ao validar a sessao HBX.");
  }

  if (data && (data.ok === false || data.valid === false)) {
    throw createHttpError(401, data.error || data.message || "Sessao HBX recusada.");
  }

  return data;
}

exports.signInAdminFromHbx = onRequest({
  region: "southamerica-east1",
  serviceAccount: FUNCTION_SERVICE_ACCOUNT
}, async (req, res) => {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = parseBody(req);
    const sessionToken = sanitizeText(body.sessionToken);

    if (!sessionToken) {
      throw createHttpError(400, "Sessao HBX ausente.");
    }

    const hbxResult = await verifyHbxSession(sessionToken);
    const refreshedSessionToken = sanitizeText(hbxResult.sessionToken || hbxResult.data?.sessionToken, sessionToken);
    const adminUid = sanitizeText(process.env.HBX_FIREBASE_UID, DEFAULT_ADMIN_UID);
    const firebaseCustomToken = await admin.auth().createCustomToken(adminUid, {
      hbxVerified: true,
      websiteAdmin: true
    });

    res.status(200).json({
      ok: true,
      firebaseCustomToken,
      sessionToken: refreshedSessionToken
    });
  } catch (error) {
    logger.error("Falha ao criar a sessao Firebase a partir do HBX.", error);

    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message || "Nao foi possivel abrir o admin com a sessao HBX."
    });
  }
});
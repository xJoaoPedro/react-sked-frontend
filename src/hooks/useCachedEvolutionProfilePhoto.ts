import { useEffect, useState } from "react";

type EvolutionProfile = {
  connected?: boolean;
  phoneMismatch?: boolean;
  profilePictureUrl?: string | null;
};

type CachedProfilePhoto = {
  dataUrl: string | null;
  url: string | null;
  updatedAt: string;
};

const STORAGE_KEY_PREFIX = "sked:evolution-profile-photo";

function getStorageKey(companyId: string | null | undefined) {
  return `${STORAGE_KEY_PREFIX}:${companyId || "unknown"}`;
}

function readCachedProfilePhoto(companyId: string | null | undefined): CachedProfilePhoto | null {
  if (!companyId || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(companyId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedProfilePhoto;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      dataUrl: typeof parsed.dataUrl === "string" ? parsed.dataUrl : null,
      url: typeof parsed.url === "string" ? parsed.url : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeCachedProfilePhoto(
  companyId: string | null | undefined,
  payload: CachedProfilePhoto,
) {
  if (!companyId || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getStorageKey(companyId), JSON.stringify(payload));
  } catch {
    return;
  }
}

function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Nao foi possivel converter a imagem."));
    };
    reader.onerror = () => reject(reader.error || new Error("Erro ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}

async function cacheProfilePhoto(
  companyId: string | null | undefined,
  profilePictureUrl: string,
) {
  if (!companyId || !profilePictureUrl) return null;

  if (profilePictureUrl.startsWith("data:image/")) {
    const directPayload = {
      dataUrl: profilePictureUrl,
      url: profilePictureUrl,
      updatedAt: new Date().toISOString(),
    };
    writeCachedProfilePhoto(companyId, directPayload);
    return directPayload;
  }

  try {
    const response = await fetch(profilePictureUrl);
    if (!response.ok) {
      throw new Error(`Erro ao baixar imagem: ${response.status}`);
    }

    const dataUrl = await fileToDataUrl(await response.blob());
    const payload = {
      dataUrl,
      url: profilePictureUrl,
      updatedAt: new Date().toISOString(),
    };

    writeCachedProfilePhoto(companyId, payload);
    return payload;
  } catch {
    const fallbackPayload = {
      dataUrl: readCachedProfilePhoto(companyId)?.dataUrl || null,
      url: profilePictureUrl,
      updatedAt: new Date().toISOString(),
    };

    writeCachedProfilePhoto(companyId, fallbackPayload);
    return fallbackPayload;
  }
}

function resolveProfilePhoto(
  companyId: string | null | undefined,
  evolution?: EvolutionProfile | null,
) {
  if (evolution?.phoneMismatch) return null;

  if (evolution?.profilePictureUrl) {
    return evolution.profilePictureUrl;
  }

  const cached = readCachedProfilePhoto(companyId);
  return cached?.dataUrl || cached?.url || null;
}

export function useCachedEvolutionProfilePhoto(
  companyId: string | null | undefined,
  evolution?: EvolutionProfile | null,
) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() =>
    resolveProfilePhoto(companyId, evolution),
  );

  useEffect(() => {
    setProfilePhoto(resolveProfilePhoto(companyId, evolution));
  }, [companyId, evolution?.phoneMismatch, evolution?.profilePictureUrl]);

  useEffect(() => {
    const livePhoto = evolution?.profilePictureUrl;

    if (!companyId || !livePhoto || evolution?.phoneMismatch) return;

    let active = true;

    cacheProfilePhoto(companyId, livePhoto).then((cached) => {
      if (!active || !cached) return;
      setProfilePhoto(cached.dataUrl || cached.url || livePhoto);
    });

    return () => {
      active = false;
    };
  }, [companyId, evolution?.phoneMismatch, evolution?.profilePictureUrl]);

  return profilePhoto;
}

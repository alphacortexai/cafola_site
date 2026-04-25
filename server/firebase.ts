type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { mapValue: { fields: Record<string, FirestoreValue> } }
  | { arrayValue: { values: FirestoreValue[] } };

type FirestoreDocumentResponse = {
  fields?: Record<string, FirestoreValue>;
};

type FirestoreCollectionResponse = {
  documents?: Array<{ fields?: Record<string, FirestoreValue> }>;
};

type FirebaseConfig = {
  apiKey: string;
  projectId: string;
};

function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey =
    process.env.FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    return null;
  }

  return { apiKey, projectId };
}

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };

  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }

  if (typeof value === "object") {
    const fields = Object.entries(value).reduce<Record<string, FirestoreValue>>(
      (acc, [key, nestedValue]) => {
        acc[key] = toFirestoreValue(nestedValue);
        return acc;
      },
      {}
    );
    return { mapValue: { fields } };
  }

  return { nullValue: null };
}

function fromFirestoreValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("nullValue" in value) return null;

  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map(fromFirestoreValue);
  }

  if ("mapValue" in value) {
    const fields = value.mapValue.fields ?? {};
    return Object.entries(fields).reduce<Record<string, unknown>>(
      (acc, [key, nestedValue]) => {
        acc[key] = fromFirestoreValue(nestedValue);
        return acc;
      },
      {}
    );
  }

  return null;
}

function docUrl(path: string) {
  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  return `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${path}?key=${config.apiKey}`;
}

export async function readFirestoreDocument<T>(
  path: string
): Promise<T | null> {
  const url = docUrl(path);
  if (!url) return null;

  const response = await fetch(url);
  if (!response.ok) return null;

  const body = (await response.json()) as FirestoreDocumentResponse;
  if (!body.fields) return null;
  return fromFirestoreValue({ mapValue: { fields: body.fields } }) as T;
}

export async function writeFirestoreDocument(
  path: string,
  payload: unknown
): Promise<boolean> {
  const url = docUrl(path);
  if (!url) return false;

  const map = toFirestoreValue(payload);
  const fields = "mapValue" in map ? map.mapValue.fields : {};

  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });

  return response.ok;
}

export async function createFirestoreDocument(
  collectionPath: string,
  payload: unknown
): Promise<boolean> {
  const url = docUrl(collectionPath);
  if (!url) return false;

  const map = toFirestoreValue(payload);
  const fields = "mapValue" in map ? map.mapValue.fields : {};

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });

  return response.ok;
}

export async function listFirestoreCollection<T>(
  collectionPath: string,
  options?: { pageSize?: number; orderBy?: string }
): Promise<T[] | null> {
  const baseUrl = docUrl(collectionPath);
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  if (options?.pageSize) {
    url.searchParams.set("pageSize", String(options.pageSize));
  }
  if (options?.orderBy) {
    url.searchParams.set("orderBy", options.orderBy);
  }

  const response = await fetch(url.toString());
  if (!response.ok) return null;

  const body = (await response.json()) as FirestoreCollectionResponse;
  if (!body.documents?.length) {
    return [];
  }

  return body.documents
    .map(document => document.fields)
    .filter((fields): fields is Record<string, FirestoreValue> =>
      Boolean(fields)
    )
    .map(fields => fromFirestoreValue({ mapValue: { fields } }) as T);
}

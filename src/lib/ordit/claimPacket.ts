export interface EvidenceManifest {
  files: Array<{
    name: string;
    size: number;
    type: string;
    url: string;
    uploaded_at: string;
  }>;
  total_files: number;
  manifest_hash: string;
}

export interface EvidenceFileLike {
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  created_at: string;
}

export function buildEvidenceManifest(files: EvidenceFileLike[]): EvidenceManifest {
  const fileEntries = files.map((f) => ({
    name: f.file_name,
    size: f.file_size,
    type: f.file_type,
    url: f.file_url,
    uploaded_at: f.created_at,
  }));

  const manifestStr = JSON.stringify(fileEntries);

  // Simple deterministic hash for manifest
  let hash = 0;
  for (let i = 0; i < manifestStr.length; i++) {
    const char = manifestStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return {
    files: fileEntries,
    total_files: files.length,
    manifest_hash: "0x" + Math.abs(hash).toString(16).padStart(8, "0"),
  };
}

export function serializeManifest(manifest: EvidenceManifest): string {
  return JSON.stringify(manifest);
}

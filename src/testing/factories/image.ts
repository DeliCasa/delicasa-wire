/**
 * Proto JSON test fixture factories for ImageService messages.
 *
 * Returns plain objects compatible with `fromJson()` from `@bufbuild/protobuf`.
 * No generated code imports — consumers cast to `JsonValue` themselves.
 */

import {
  makeCorrelationId,
  makeTimestamp,
  mergeDefaults,
} from "../helpers.js";

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

const IMAGE_DEFAULTS = {
  id: "img-test-001",
  objectKey: "captures/img-test-001.jpg",
  controllerId: "ctrl-test-001",
  containerId: "ctn-test-001",
  sessionId: "sess-test-001",
  captureTag: "before_open",
  contentType: "image/jpeg",
  sizeBytes: "245760",
  width: 1600,
  height: 1200,
  createdAt: makeTimestamp(),
} as const;

type ImageOverrides = Partial<Record<keyof typeof IMAGE_DEFAULTS, unknown>>;

export function makeImage(overrides?: ImageOverrides) {
  return mergeDefaults(
    { ...IMAGE_DEFAULTS, createdAt: makeTimestamp() },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// ListImagesResponse
// ---------------------------------------------------------------------------

export function makeListImagesResponse(
  overrides?: Partial<{
    correlationId: string;
    images: ReturnType<typeof makeImage>[];
    nextPageToken: string;
    totalCount: number;
  }>,
) {
  const images = overrides?.images ?? [makeImage()];
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      images,
      nextPageToken: "",
      totalCount: images.length,
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// SearchImagesResponse
// ---------------------------------------------------------------------------

export function makeSearchImagesResponse(
  overrides?: Partial<{
    correlationId: string;
    images: ReturnType<typeof makeImage>[];
    nextPageToken: string;
    totalCount: number;
  }>,
) {
  const images = overrides?.images ?? [makeImage()];
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      images,
      nextPageToken: "",
      totalCount: images.length,
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// GetPresignedUrlResponse
// ---------------------------------------------------------------------------

export function makeGetPresignedUrlResponse(
  overrides?: Partial<{
    correlationId: string;
    url: string;
    expiresAt: string;
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      url: "https://r2.example.com/captures/img-test-001.jpg?X-Amz-Signature=abc123",
      expiresAt: makeTimestamp(new Date("2026-03-06T11:00:00Z")),
    },
    overrides,
  );
}

/**
 * Round-trip deserialization tests for ImageService factory functions.
 *
 * Each test calls a factory, passes the result through `fromJson()`,
 * and asserts the deserialized proto message has the expected field values.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { resetCorrelationCounter } from "../../src/testing/helpers.js";
import {
  makeImage,
  makeListImagesResponse,
  makeSearchImagesResponse,
  makeGetPresignedUrlResponse,
} from "../../src/testing/factories/image.js";
import {
  ListImagesResponseSchema,
  SearchImagesResponseSchema,
  GetPresignedUrlResponseSchema,
} from "../../gen/ts/delicasa/v1/image_service_pb.js";

describe("ImageService factories", () => {
  beforeEach(() => {
    resetCorrelationCounter();
  });

  it("makeImage() — verify via ListImagesResponse; check id, objectKey, width, height", () => {
    const json = makeListImagesResponse({
      images: [makeImage()],
      totalCount: 1,
    });
    const msg = fromJson(ListImagesResponseSchema, json as JsonValue);

    expect(msg.images).toHaveLength(1);
    const img = msg.images[0]!;
    expect(img.id).toBe("img-test-001");
    expect(img.objectKey).toBe("captures/img-test-001.jpg");
    expect(img.width).toBe(1600);
    expect(img.height).toBe(1200);
    expect(img.controllerId).toBe("ctrl-test-001");
    expect(img.containerId).toBe("ctn-test-001");
    expect(img.sessionId).toBe("sess-test-001");
    expect(img.captureTag).toBe("before_open");
    expect(img.contentType).toBe("image/jpeg");
    expect(img.sizeBytes).toBe(BigInt(245760));
    expect(img.createdAt).toBeDefined();
  });

  it("makeImage({ captureTag: 'after_close' }) — override captureTag", () => {
    const json = makeListImagesResponse({
      images: [makeImage({ captureTag: "after_close" })],
      totalCount: 1,
    });
    const msg = fromJson(ListImagesResponseSchema, json as JsonValue);

    expect(msg.images[0]!.captureTag).toBe("after_close");
  });

  it("makeListImagesResponse() — default has 1 image, verify totalCount", () => {
    const json = makeListImagesResponse();
    const msg = fromJson(ListImagesResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.images).toHaveLength(1);
    expect(msg.totalCount).toBe(1);
    expect(msg.images[0]!.id).toBe("img-test-001");
  });

  it("makeSearchImagesResponse() — verify correlationId and images array", () => {
    const json = makeSearchImagesResponse();
    const msg = fromJson(SearchImagesResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.images).toHaveLength(1);
    expect(msg.totalCount).toBe(1);
    expect(msg.images[0]!.id).toBe("img-test-001");
  });

  it("makeGetPresignedUrlResponse() — verify url contains signature, expiresAt defined", () => {
    const json = makeGetPresignedUrlResponse();
    const msg = fromJson(GetPresignedUrlResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.url).toContain("X-Amz-Signature");
    expect(msg.expiresAt).toBeDefined();
  });
});

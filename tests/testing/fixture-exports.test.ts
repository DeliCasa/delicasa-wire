/**
 * Fixture Export Tests — verify golden vector JSON files contain expected keys
 * and are importable as modules.
 */
import { describe, expect, it } from "vitest";

import cameraFixtures from "../vectors/fixtures/camera-service.json";
import captureFixtures from "../vectors/fixtures/capture-service.json";
import clientCaptureFixtures from "../vectors/fixtures/client-capture-service.json";
import evidenceFixtures from "../vectors/fixtures/evidence-service.json";
import sessionFixtures from "../vectors/fixtures/session-service.json";
import imageFixtures from "../vectors/fixtures/image-service.json";

describe("Fixture Exports", () => {
  it("camera-service.json contains expected fixture keys", () => {
    const keys = Object.keys(cameraFixtures);
    expect(keys).toContain("ListCamerasResponse");
    expect(keys).toContain("GetCameraResponse");
    expect(keys).toContain("GetCameraStatusResponse");
    expect(keys).toContain("ReconcileCamerasResponse");
    expect(keys.length).toBeGreaterThanOrEqual(4);
  });

  it("capture-service.json contains expected fixture keys", () => {
    const keys = Object.keys(captureFixtures);
    expect(keys).toContain("CaptureImageRequest");
    expect(keys).toContain("CaptureImageResponse");
    expect(keys.length).toBeGreaterThanOrEqual(2);
  });

  it("evidence-service.json contains expected fixture keys", () => {
    const keys = Object.keys(evidenceFixtures);
    expect(keys).toContain("GetEvidencePairResponse");
    expect(keys).toContain("GetSessionEvidenceResponse");
    expect(keys.length).toBeGreaterThanOrEqual(2);
  });

  it("session-service.json contains expected fixture keys", () => {
    const keys = Object.keys(sessionFixtures);
    expect(keys).toContain("ListSessionsResponse");
    expect(keys).toContain("GetSessionResponse");
    expect(keys.length).toBeGreaterThanOrEqual(2);
  });

  it("client-capture-service.json contains expected fixture keys", () => {
    const keys = Object.keys(clientCaptureFixtures);
    expect(keys).toContain("RequestCaptureRequest");
    expect(keys).toContain("RequestCaptureResponse");
    expect(keys).toContain("GetCaptureStatusRequest");
    expect(keys).toContain("GetCaptureStatusResponse");
    expect(keys.length).toBeGreaterThanOrEqual(4);
  });

  it("image-service.json contains expected fixture keys", () => {
    const keys = Object.keys(imageFixtures);
    expect(keys).toContain("ListImagesResponse");
    expect(keys).toContain("SearchImagesResponse");
    expect(keys).toContain("GetPresignedUrlResponse");
    expect(keys.length).toBeGreaterThanOrEqual(3);
  });
});

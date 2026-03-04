export const MqttTopics = {
  VALIDATION_ERROR: "camera/response/_invalid/error",

  cameraResponse(requestId: string, subtopic?: string): string {
    const base = `camera/response/${requestId}`;
    return subtopic ? `${base}/${subtopic}` : base;
  },

  cameraStatus(deviceId: string): string {
    return `camera/status/${deviceId}`;
  },

  cameraCommand(deviceId: string): string {
    return `camera/command/${deviceId}`;
  },

  containerCamera(
    containerId: string,
    mac: string,
    subtopic: string,
  ): string {
    return `delicasa/${containerId}/camera/${mac}/${subtopic}`;
  },
} as const;

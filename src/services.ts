import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromCluster();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);

interface Service {
  name: string;
  available: boolean;
  lastUpdate: string;
}

type GroupedServices = Map<string, Service[]>;

export async function getServices(): Promise<GroupedServices> {
  const data: GroupedServices = new Map();

  // We contact k8s to get the endpoints
  const res = await coreApi.listEndpointsForAllNamespaces();

  const doesItHaveAName = (endpoint: k8s.V1Endpoints): string | undefined => {
    if (!endpoint.metadata) return undefined;
    if (!endpoint.metadata.annotations) return undefined;
    if (!endpoint.metadata.annotations["status.fhex.dev/name"]) return undefined;

    return endpoint.metadata.annotations["status.fhex.dev/name"];
  }

  const doesItHaveAGroup = (endpoint: k8s.V1Endpoints): string | undefined => {
    if (!endpoint.metadata) return undefined;
    if (!endpoint.metadata.annotations) return undefined;
    if (!endpoint.metadata.annotations["status.fhex.dev/group"]) return undefined;

    return endpoint.metadata.annotations["status.fhex.dev/group"];
  }

  const services = res.body.items.forEach((endpoint: k8s.V1Endpoints) => {
    const name = doesItHaveAName(endpoint);

    if (name) {
      // We create the service
      const service: Service = {
        name,
        available: (endpoint.subsets ?? []).length > 0,
        lastUpdate: ((endpoint.metadata ?? {}).annotations ?? {})["endpoints.kubernetes.io/last-change-trigger-time"],
      };

      // We find the group
      const groupStr = doesItHaveAGroup(endpoint) ?? "Default";
      const group = data.get(groupStr) ?? [];
      group.push(service);
      data.set(groupStr, group);
    }
  });

  return data;
}

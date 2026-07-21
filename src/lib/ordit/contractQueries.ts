import {
  getDashboard,
  getDataset,
  getInsightRequest,
  getLatestDecisionForRequest,
  getOrgDashboardIndex,
  getOrgDatasetIndex,
  getOrganization,
  getOrganizationIndex,
  getOrgRequestIndex,
  getUserOrganizationIndex,
} from "@/lib/genlayer/orditContract";
import type {
  ContractDashboard,
  ContractDataset,
  ContractOrganization,
  InsightAuditRequest,
  InsightDecision,
} from "@/types";

export async function getOrganizationsForWallet(wallet: string): Promise<ContractOrganization[]> {
  let ids: string[] = [];
  try {
    ids = await getUserOrganizationIndex(wallet);
  } catch {
    ids = [];
  }
  const fallbackIds = ids.length ? ids : await getOrganizationIndex();
  const orgs = await Promise.all(fallbackIds.map((id) => getOrganization(id)));
  const lower = wallet.toLowerCase();
  return orgs.filter((org) => org.id && (!ids.length ? org.owner.toLowerCase() === lower : true));
}

export async function getDatasetsForOrganizations(orgIds: string[]): Promise<ContractDataset[]> {
  const indexGroups = await Promise.all(orgIds.map((id) => getOrgDatasetIndex(id)));
  const ids = Array.from(new Set(indexGroups.flat()));
  return Promise.all(ids.map((id) => getDataset(id)));
}

export async function getDashboardsForOrganizations(orgIds: string[]): Promise<ContractDashboard[]> {
  const indexGroups = await Promise.all(orgIds.map((id) => getOrgDashboardIndex(id)));
  const ids = Array.from(new Set(indexGroups.flat()));
  return Promise.all(ids.map((id) => getDashboard(id)));
}

export async function getRequestsForOrganizations(
  orgIds: string[],
): Promise<Array<InsightAuditRequest & { decision?: InsightDecision }>> {
  const indexGroups = await Promise.all(orgIds.map((id) => getOrgRequestIndex(id)));
  const ids = Array.from(new Set(indexGroups.flat()));
  const requests = await Promise.all(ids.map((id) => getInsightRequest(id)));
  const withDecisions = await Promise.all(
    requests
      .filter((request) => request.id)
      .map(async (request) => {
        const decision = await getLatestDecisionForRequest(request.id);
        return decision.id ? { ...request, decision } : request;
      }),
  );
  return withDecisions;
}

import { createClient } from "genlayer-js";
import { createOrganization } from "@/lib/genlayer/orditContract";

const connectMock = jest.fn();
const writeContractMock = jest.fn();
const waitForTransactionReceiptMock = jest.fn();
const readContractMock = jest.fn();
const providerRequestMock = jest.fn();

jest.mock("genlayer-js", () => ({
  createClient: jest.fn(),
}));

jest.mock("genlayer-js/chains", () => ({
  studionet: { id: 61999, name: "StudioNet" },
}));

jest.mock("genlayer-js/types", () => ({
  TransactionStatus: { ACCEPTED: "ACCEPTED" },
}));

jest.mock("@/lib/genlayer/config", () => ({
  GENLAYER_CONFIG: {
    chainId: 61999,
    rpcUrl: "https://studio.genlayer.com/api",
    explorerUrl: "https://explorer-studio.genlayer.com",
    contractAddress: "0x2222222222222222222222222222222222222222",
    defaultSender: "0x0000000000000000000000000000000000000001",
  },
}));

describe("GenLayer browser wallet writes", () => {
  beforeEach(() => {
    connectMock.mockResolvedValue(undefined);
    writeContractMock.mockResolvedValue("0xtx");
    waitForTransactionReceiptMock.mockResolvedValue({ result: "ORG-TEST" });
    readContractMock.mockResolvedValue("");
    providerRequestMock.mockImplementation(({ method }: { method: string }) => {
      if (method === "eth_chainId") return Promise.resolve("0xf22f");
      return Promise.resolve(null);
    });
    (createClient as jest.Mock).mockReturnValue({
      connect: connectMock,
      writeContract: writeContractMock,
      waitForTransactionReceipt: waitForTransactionReceiptMock,
      readContract: readContractMock,
    });

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        ethereum: {
          request: providerRequestMock,
        },
      },
    });
  });

  it("passes an address-bearing account object to genlayer-js writes", async () => {
    await createOrganization(
      {
        org_id: "ORG-TEST",
        name: "QA Org",
        industry: "Technology",
        metadata_hash: "meta",
        created_at: "2026-07-28T09:55:00.000Z",
      },
      "0x1111111111111111111111111111111111111111",
    );

    expect(writeContractMock).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          address: "0x1111111111111111111111111111111111111111",
        }),
        functionName: "create_organization",
        kwargs: expect.objectContaining({
          org_id: "ORG-TEST",
          name: "QA Org",
        }),
      }),
    );
    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        account: "0x1111111111111111111111111111111111111111",
      }),
    );
    expect(connectMock).not.toHaveBeenCalled();
    expect(providerRequestMock).toHaveBeenCalledWith({ method: "eth_chainId" });
    expect(providerRequestMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ method: "wallet_requestSnaps" }),
    );
  });
});

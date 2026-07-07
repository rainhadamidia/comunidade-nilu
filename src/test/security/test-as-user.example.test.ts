import { describe, it, expect } from "vitest";
import { createAuthenticatedTestUserClient, hasTestUserCredentials } from "./test-as-user.setup";

// Placeholder: prova que a infraestrutura de auth-em-teste funciona ponta a ponta.
// Os casos REAIS de seguranca (negativos/positivos de DBT-S01/S02/S03/S06) sao
// adicionados nas Stories 2-5 do Epic 01, nao aqui.
describe.skipIf(!hasTestUserCredentials)("test-as-user infra (placeholder)", () => {
  it("autentica como usuario comum e le o proprio profile", async () => {
    const { client, user } = await createAuthenticatedTestUserClient();

    const { data, error } = await client
      .from("profiles")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });
});

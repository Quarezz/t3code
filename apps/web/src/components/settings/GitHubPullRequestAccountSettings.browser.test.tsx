import { sourceControlClients } from "@t3tools/client-runtime/source-control-clients";
import {
  DEFAULT_SERVER_SETTINGS,
  EnvironmentId,
  SourceControlProviderKind,
} from "@t3tools/contracts";
import { expect, it, vi } from "vite-plus/test";

import { render } from "../../../test/render";
import { GitHubPullRequestAccountSettings } from "./GitHubPullRequestAccountSettings";

const mocks = vi.hoisted(() => ({ update: vi.fn().mockResolvedValue({ _tag: "Success" }) }));
vi.mock("../../state/use-atom-command", () => ({ useAtomCommand: () => mocks.update }));
vi.mock("../../hooks/useSettings", () => ({
  useEnvironmentSettings: (
    _id: EnvironmentId,
    select: (settings: typeof DEFAULT_SERVER_SETTINGS) => unknown,
  ) => select(DEFAULT_SERVER_SETTINGS),
}));

it("saves two named accounts together and refuses incomplete edits", async () => {
  const environmentId = EnvironmentId.make("test");
  const settings = sourceControlClients.find(SourceControlProviderKind.make("github"))?.settings;
  if (settings === undefined) throw new Error("Missing GitHub settings");
  await using screen = await render(
    <GitHubPullRequestAccountSettings
      environmentId={environmentId}
      settings={settings}
      onSaved={vi.fn()}
    />,
  );
  const rules = screen.getByRole("textbox", { name: "Pull request accounts" });
  const save = screen.getByRole("button", { name: "Save pull request accounts" });
  await rules.fill("github.com/personal=");
  await expect.element(save).toBeDisabled();
  const value = "github.com/personal=personal-login\ngithub.com/example-org=work-login";
  await rules.fill(value);
  await expect.element(save).toBeEnabled();
  await save.click();
  expect(mocks.update).toHaveBeenCalledExactlyOnceWith({
    environmentId,
    input: { patch: { sourceControlHosts: { github: { pullRequestAccounts: value } } } },
  });
});

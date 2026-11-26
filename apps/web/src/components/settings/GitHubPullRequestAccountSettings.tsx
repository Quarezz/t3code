import type { EnvironmentId } from "@t3tools/contracts";
import type { SourceControlDefinition } from "@t3tools/client-runtime/source-control-clients";
import { T, useGT } from "gt-react";
import { useId, useState } from "react";

import { useEnvironmentSettings } from "../../hooks/useSettings";
import { serverEnvironment } from "../../state/server";
import { useAtomCommand } from "../../state/use-atom-command";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { deriveProviderSettingsFields } from "./ProviderSettingsForm";

export function GitHubPullRequestAccountSettings({
  environmentId,
  settings,
  onSaved,
}: {
  readonly environmentId: EnvironmentId;
  readonly settings: NonNullable<SourceControlDefinition["settings"]>;
  readonly onSaved: () => void;
}) {
  const id = useId();
  const gt = useGT();
  const value = useEnvironmentSettings(environmentId, (serverSettings) => {
    const saved = serverSettings.sourceControlHosts.github?.pullRequestAccounts;
    return typeof saved === "string" ? saved : "";
  });
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const update = useAtomCommand(serverEnvironment.updateSettings, {
    label: "save GitHub pull request accounts",
  });
  const rules = (draft ?? value).trim();
  const field = deriveProviderSettingsFields({ settingsSchema: settings }).find(
    ({ key }) => key === "pullRequestAccounts",
  );
  const valid = field?.accepts?.(rules) === true;

  const save = async () => {
    setSaving(true);
    const result = await update({
      environmentId,
      input: { patch: { sourceControlHosts: { github: { pullRequestAccounts: rules } } } },
    });
    setSaving(false);
    if (result._tag === "Success") {
      setDraft(null);
      onSaved();
    }
  };

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-xs font-medium">
        <T>Pull request accounts</T>
      </label>
      <p id={`${id}-help`} className="text-xs text-muted-foreground">
        <T>
          Enter one host/owner=login per line. Repositories without a rule use the default login.
        </T>
      </p>
      <Textarea
        id={id}
        aria-describedby={`${id}-help`}
        aria-invalid={!valid}
        disabled={saving}
        placeholder="github.com/example-org=work-login"
        value={draft ?? value}
        onChange={(event) => setDraft(event.currentTarget.value)}
        spellCheck={false}
      />
      <Button
        type="button"
        size="xs"
        variant="outline"
        className="justify-self-end"
        aria-label={gt("Save pull request accounts")}
        disabled={!valid || rules === value || saving}
        onClick={() => void save()}
      >
        <T>Save</T>
      </Button>
    </div>
  );
}

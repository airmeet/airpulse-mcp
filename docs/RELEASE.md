# Release checklist

1. **Validate.** CI passes: `claude plugin validate --strict` on the marketplace and plugin manifests, manifest JSON checks and skill frontmatter lint.
2. **Contract check.** Every tool and argument named in `skills/` exists in `tools/list` on the target endpoint. Update skills and evaluation cases for any server change.
3. **Dev acceptance.** With `.mcp.json` pointed at `https://dev-api.airpulse.ai/mcp` in a local copy only, run `claude plugin marketplace add ./` and `claude plugin install airpulse@airpulse`. Confirm the browser OAuth flow and org picker, that `list_brands` works, and that the skills load. Record the result in [compatibility](COMPATIBILITY.md).
4. **Prod readiness.** Before tagging a release that points at prod, confirm prod serves `/.well-known/oauth-protected-resource/mcp`, answers `/mcp` without a redirect, and returns the same tools as dev. Repeat step 3 against prod.
5. **Version.** Bump `version` in `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` together and add a `CHANGELOG.md` entry. Clients see a new version only when this field changes.
6. **Publish.** Merge to `main` and tag `v<version>`. Users update with `/plugin marketplace update airpulse`.
7. **Directory submission** (claude.ai directory, OpenAI apps) is a separate decision for the owner. The repository is MIT licensed; the privacy policy is https://airpulse.ai/privacy and support is support@airpulse.ai.

Rollback: revert the release commit on `main` and bump the version so clients pick up the revert. Reverting the plugin does not revert the hosted server.

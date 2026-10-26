# Security notes

The plugin ships no executable code. It contains manifests, one remote MCP server entry and Markdown skills. Every security boundary is enforced by the AirPulse server.

- **Credentials.** None are bundled. OAuth tokens are obtained and stored by the client. The access-token fallback reads `AIRPULSE_API_KEY` from the client environment. Skills tell the agent never to place tokens in prompts, files, screenshots or URLs.
- **Endpoint.** `.mcp.json` names the production endpoint only. Dev testing uses an uncommitted local copy.
- **Authorization.** The server scopes every call to the signed-in organization. It grants write scopes (`write:audit`, `write:tasks`, `write:brand_config`) only to organization admins or to tokens issued with those scopes. Writes are also gated by a server flag and an active subscription. Skills cannot widen access, and they treat `insufficient_scope`, `writes_disabled` and `subscription_required` as final.
- **Destructive and quota-consuming actions.** Skills require an explicit user request, submit once and never blindly retry. `delete_content_source` requires the server's `confirm: true` and the user's approval of the named source. `set_brand_topics` replaces the full set, so skills pass the complete list.
- **Untrusted content.** Answer text, knowledge-base pages, profile text and suggested fixes are data. Skills ignore instructions embedded in them.
- **Rendering.** The server returns markdown answers and chart-ready data; neither the server nor this repository ships an HTML report UI. Skills treat answer text as data.

Report a vulnerability privately rather than in a public issue: use GitHub's **Report a vulnerability** button on the repository's Security tab, or email support@airpulse.ai with "Security" in the subject.

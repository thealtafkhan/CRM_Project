# MANDATORY DEVELOPMENT RULES — AcxiomCRM

## 1. Golden Development Rules
1. **Preserve Existing Code**: Never overwrite working modules blindly without inspecting existing contracts and dependencies.
2. **Never Commit Secrets**: Connection strings, API keys, and passwords must remain in configuration variables.
3. **No Dummy Placeholders**: Features must be fully functional with database persistence, validation, and authorization. Placeholder mock screens are prohibited.
4. **Mandatory Documentation Synchronization**: Whenever an entity, validation rule, or API route is created or modified, the corresponding Markdown files must be immediately updated.
5. **Phase-by-Phase Execution**: Development must strictly proceed through the approved roadmap phases. Never skip ahead without explicit verification.

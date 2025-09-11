"use client"

import { useTranslations } from "@/components/translations-context"


export function ToolsEducation() {
  const { t } = useTranslations();

  const availableTools = [
    {
      name: t('tools.availableTools.copyFn.name'),
      description: t('tools.availableTools.copyFn.description'),
    },
    {
      name: t('tools.availableTools.getTime.name'),
      description: t('tools.availableTools.getTime.description'),
    },
    {
      name: t('tools.availableTools.themeSwitcher.name'),
      description: t('tools.availableTools.themeSwitcher.description'),
    },
    {
      name: t('tools.availableTools.partyMode.name'),
      description: t('tools.availableTools.partyMode.description'),
    },
    {
      name: t('tools.availableTools.launchWebsite.name'),
      description: t('tools.availableTools.launchWebsite.description'),
    },
    {
      name: t('tools.availableTools.scrapeWebsite.name'),
      description: t('tools.availableTools.scrapeWebsite.description'),
    },
  ] as const;

  return (
    <div className="w-full max-w-lg mt-4">
      <div className="text-sm text-gray-600">
        Available tools: {availableTools.length}
      </div>
    </div>
  )
} 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface VoiceSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function VoiceSelector({ value, onValueChange }: VoiceSelectorProps) {
  return (
    <div className="form-group space-y-2">
      <Label htmlFor="voiceSelect" className="text-sm font-medium">Select a voice</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ash">Ash - Gentle & Professional</SelectItem>
          <SelectItem value="ballad">Ballad - Warm & Engaging</SelectItem>
          <SelectItem value="coral">Coral - Clear & Friendly</SelectItem>
          <SelectItem value="sage">Sage - Authoritative & Calm</SelectItem>
          <SelectItem value="verse">Verse - Dynamic & Expressive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 
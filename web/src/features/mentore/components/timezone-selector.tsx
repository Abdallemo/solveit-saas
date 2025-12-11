"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils/utils"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import * as React from "react"


const timezones = Intl.supportedValuesOf("timeZone").map((tz) => ({
  value: tz,
  label: tz.replace(/_/g, " "),
}))

export function TimezoneSelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [currentTime, setCurrentTime] = React.useState<string>("")

  // Update current time for selected timezone
  React.useEffect(() => {
    if (!value) return

    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: value,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        setCurrentTime(formatter.format(new Date()))
      } catch (error) {
        setCurrentTime("Invalid timezone")
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [value])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone Selection
          </CardTitle>
          <CardDescription>Search and select your timezone from the list</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-transparent"
              >
                {value ? timezones.find((timezone) => timezone.value === value)?.label : "Select timezone..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search timezone..." />
                <CommandList>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup>
                    {timezones.map((timezone) => (
                      <CommandItem
                        key={timezone.value}
                        value={timezone.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", value === timezone.value ? "opacity-100" : "opacity-0")} />
                        {timezone.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {value && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Time</CardTitle>
            <CardDescription>{timezones.find((tz) => tz.value === value)?.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-semibold">{currentTime}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

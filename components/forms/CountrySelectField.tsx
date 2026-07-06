'use client';

import React, { useMemo, useState } from 'react'
import { Controller } from "react-hook-form";
import countryList from "react-select-country-list";
import { ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

const CountrySelectField = ({ name, label, control, error, required = false }: CountrySelectProps) => {
    const [open, setOpen] = useState(false);
    const countries = useMemo(() => countryList().getData(), []);

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="form-label">{label}</Label>

            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                render={({ field }) => {
                    const selected = countries.find((country) => country.value === field.value);

                    return (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="country-select-trigger"
                                    />
                                }
                            >
                                {selected ? selected.label : 'Select your country'}
                                <ChevronsUpDown className="size-4 opacity-50" />
                            </PopoverTrigger>

                            <PopoverContent className="w-(--anchor-width) p-0 bg-gray-800 border-gray-600">
                                <Command className="bg-gray-800">
                                    <CommandInput
                                        placeholder="Search for a country..."
                                        className="country-select-input"
                                    />
                                    <CommandList>
                                        <CommandEmpty className="country-select-empty">
                                            No country found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {countries.map((country) => (
                                                <CommandItem
                                                    key={country.value}
                                                    value={country.label}
                                                    data-checked={field.value === country.value}
                                                    className="country-select-item"
                                                    onSelect={() => {
                                                        field.onChange(country.value);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    {country.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />

            {error && <p className="text-sm text-red-500">{error.message}</p>}
            <p className='text-xs text-gray-500'>
                Helps us show market data and news relevant to you.
            </p>
        </div>
    )
}
export default CountrySelectField;

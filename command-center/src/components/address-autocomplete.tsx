"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

// Define the service area counties (matching index.html)
const SERVICE_AREA_COUNTIES: Record<string, string[]> = {
    'MA': ['Hampden County', 'Hampshire County', 'Franklin County', 'Worcester County'],
    'CT': ['Hartford County', 'Tolland County', 'Windham County', 'Litchfield County']
};

const GOOGLE_MAPS_API_KEY = "AIzaSyAPV9GVBwLktmWPKyn90lk1zOtZ7X_n9d0";

interface AddressAutocompleteProps {
    name?: string;
    defaultValue?: string;
    required?: boolean;
    id?: string;
    placeholder?: string;
    className?: string;
}

// Global flag to track if loader has been initialized
let loaderInitialized = false;

export function AddressAutocomplete({
    name = "address",
    defaultValue = "",
    required = false,
    id = "address",
    placeholder,
    className
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [validationStatus, setValidationStatus] = useState<{
        isValid: boolean | null;
        message: string;
    }>({ isValid: null, message: "" });
    const [apiReady, setApiReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sessionTokenRef = useRef<any>(null);
    const AutocompleteSuggestionRef = useRef<any>(null);

    // Initialize Google Maps API using the same loader as index.html
    useEffect(() => {
        const initGoogleMapsLoader = () => {
            if (loaderInitialized) {
                // Already initialized, just check if ready
                checkApiReady();
                return;
            }

            // This is the exact loader from index.html (lines 62-65)
            const g = { key: GOOGLE_MAPS_API_KEY, v: "weekly", loading: "async" };

            ((g: any) => {
                let h: Promise<void> | undefined;
                let a: HTMLScriptElement;
                let k: string;
                const p = "The Google Maps JavaScript API";
                const c = "google";
                const l = "importLibrary";
                const q = "__ib__";
                const m = document;
                let b: any = window;
                b = b[c] || (b[c] = {});
                const d = b.maps || (b.maps = {});
                const r = new Set<string>();
                const e = new URLSearchParams();

                const u = (): Promise<void> => h || (h = new Promise(async (f, n) => {
                    a = m.createElement("script");
                    e.set("libraries", [...r] + "");
                    for (k in g) {
                        e.set(k.replace(/[A-Z]/g, (t: string) => "_" + t[0].toLowerCase()), g[k]);
                    }
                    e.set("callback", c + ".maps." + q);
                    a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
                    (d as any)[q] = f;
                    a.onerror = () => { h = undefined; n(Error(p + " could not load.")); };
                    a.nonce = m.querySelector("script[nonce]")?.getAttribute("nonce") || "";
                    m.head.append(a);
                }));

                if (d[l]) {
                    console.warn(p + " only loads once. Ignoring:", g);
                } else {
                    d[l] = (f: string, ...n: any[]) => {
                        r.add(f);
                        return u().then(() => d[l](f, ...n));
                    };
                }
            })(g);

            loaderInitialized = true;

            // Wait a moment then check if API is ready
            setTimeout(checkApiReady, 500);
        };

        const checkApiReady = async () => {
            const w = window as any;
            if (typeof w.google === 'undefined' || !w.google.maps) {
                // Not ready yet, retry
                setTimeout(checkApiReady, 500);
                return;
            }

            try {
                // Load the Places library using importLibrary (new API)
                const { AutocompleteSuggestion, AutocompleteSessionToken } =
                    await w.google.maps.importLibrary('places');

                AutocompleteSuggestionRef.current = AutocompleteSuggestion;
                sessionTokenRef.current = new AutocompleteSessionToken();

                setApiReady(true);
                setIsLoading(false);
                console.log('Google Places API initialized successfully');
            } catch (error) {
                console.error('Error initializing Google Places:', error);
                setTimeout(checkApiReady, 1000);
            }
        };

        initGoogleMapsLoader();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle input change and fetch suggestions
    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setValidationStatus({ isValid: null, message: "" });

        if (inputRef.current) {
            inputRef.current.setCustomValidity("");
        }

        if (value.length < 3 || !apiReady || !AutocompleteSuggestionRef.current) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        try {
            const request = {
                input: value,
                includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
                includedRegionCodes: ['us'],
                sessionToken: sessionTokenRef.current
            };

            const { suggestions: newSuggestions } =
                await AutocompleteSuggestionRef.current.fetchAutocompleteSuggestions(request);

            if (newSuggestions && newSuggestions.length > 0) {
                setSuggestions(newSuggestions);
                setShowDropdown(true);
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    // Handle place selection
    const handleSelectPlace = async (placePrediction: any) => {
        try {
            const mainText = placePrediction.text.text;
            setInputValue(mainText);
            setShowDropdown(false);

            const place = placePrediction.toPlace();
            await place.fetchFields({
                fields: ['addressComponents', 'location', 'formattedAddress']
            });

            setInputValue(place.formattedAddress);

            // Refresh session token
            const w = window as any;
            if (w.google?.maps?.places?.AutocompleteSessionToken) {
                sessionTokenRef.current = new w.google.maps.places.AutocompleteSessionToken();
            }

            validateAddress(place);
        } catch (error) {
            console.error("Error fetching place details:", error);
        }
    };

    // Validation logic (matching index.html)
    const validateAddress = (place: any) => {
        const addressComponents = place.addressComponents;
        let county = '';
        let state = '';

        for (const component of addressComponents) {
            if (component.types.includes('administrative_area_level_2')) {
                county = component.longText;
            }
            if (component.types.includes('administrative_area_level_1')) {
                state = component.shortText;
            }
        }

        console.log('Validating address - State:', state, 'County:', county);

        if (state && SERVICE_AREA_COUNTIES[state]) {
            if (SERVICE_AREA_COUNTIES[state].includes(county)) {
                setValidationStatus({
                    isValid: true,
                    message: "✓ Address is within our service area"
                });
                if (inputRef.current) inputRef.current.setCustomValidity("");
            } else {
                const message = `Sorry, ${county || 'this area'} is outside our service area. We serve Western & Central MA (Hampden, Hampshire, Franklin, Worcester counties) and Northern CT.`;
                setValidationStatus({
                    isValid: false,
                    message
                });
                if (inputRef.current) inputRef.current.setCustomValidity(message);
            }
        } else {
            const message = "Sorry, this address is outside our service area. We serve Western Massachusetts and Northern Connecticut only.";
            setValidationStatus({
                isValid: false,
                message
            });
            if (inputRef.current) inputRef.current.setCustomValidity(message);
        }
    };

    return (
        <div className="relative">
            <div className="relative">
                <Input
                    type="text"
                    id={id}
                    name={name}
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder || "Enter street address"}
                    required={required}
                    className={className}
                    ref={inputRef}
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Validation Message */}
            {validationStatus.message && (
                <div className={`mt-2 text-sm flex items-start gap-2 ${validationStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationStatus.isValid ? (
                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    <span>{validationStatus.message}</span>
                </div>
            )}

            {/* Dropdown Suggestions */}
            {showDropdown && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-500 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => {
                        const placePrediction = suggestion.placePrediction;
                        if (!placePrediction) return null;

                        return (
                            <div
                                key={index}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                onClick={() => handleSelectPlace(placePrediction)}
                            >
                                {placePrediction.text.text}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

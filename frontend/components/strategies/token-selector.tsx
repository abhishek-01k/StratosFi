import React from "react"
import Image from "next/image"
import { TokensData } from "@/types/tokens.types"
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"

interface TokenSelectorProps {
    tokens: TokensData[],
    selectedToken?: TokensData
    onChange: (token: TokensData) => void
    label: string
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
    tokens,
    selectedToken,
    onChange,
    label,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Select
                value={selectedToken?.address || ""}
                onValueChange={(address) => {
                    const token = tokens.find(t => t.address === address)
                    if (token) onChange(token)
                }}
            >
                <SelectTrigger className="flex w-full items-center justify-start gap-2">
                    {selectedToken ? (
                        <>
                            <Image
                                src={selectedToken.logo}
                                alt={selectedToken.symbol}
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                            <span className="font-semibold">{selectedToken.symbol}</span>
                            <span className="text-muted-foreground">- {selectedToken.name}</span>
                        </>
                    ) : (
                        <span>Select token</span>
                    )}
                </SelectTrigger>
                <SelectContent>
                    {tokens.map(token => (
                        <SelectItem value={token.address} key={token.address}>
                            <div className="flex items-center gap-2">
                                <Image
                                    src={token.logo}
                                    alt={token.symbol}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                />
                                <span className="font-semibold">{token.symbol}</span>
                                <span className="text-muted-foreground">- {token.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export default TokenSelector

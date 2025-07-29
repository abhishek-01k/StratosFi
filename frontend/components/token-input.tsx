'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TokenSelector } from '@/components/token-selector'
import { Token } from '@/hooks/useTokenList'

interface TokenInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  selectedToken?: Token
  onSelectToken: (token: Token) => void
  showBalance?: boolean
}

export function TokenInput({
  label,
  value,
  onChange,
  selectedToken,
  onSelectToken,
  showBalance = true
}: TokenInputProps) {
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address,
    token: selectedToken?.address !== '0x0000000000000000000000000000000000000000' 
      ? selectedToken?.address as `0x${string}` 
      : undefined,
    enabled: showBalance && !!address && !!selectedToken,
  })

  const handleMax = () => {
    if (balance) {
      onChange(balance.formatted)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        {showBalance && balance && (
          <span className="text-sm text-muted-foreground">
            Balance: {Number(balance.formatted).toFixed(6)} {selectedToken?.symbol}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            placeholder="0.0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-16"
          />
          {showBalance && balance && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMax}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
            >
              MAX
            </Button>
          )}
        </div>
        <div className="w-40">
          <TokenSelector
            selectedToken={selectedToken}
            onSelectToken={onSelectToken}
          />
        </div>
      </div>
    </div>
  )
}
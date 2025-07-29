'use client'

import { useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStrategies } from '@/context/StrategiesContext'
import { TokensData } from '@/types/tokens.types'

interface TokenSelectorProps {
  selectedToken?: TokensData
  onSelectToken: (token: TokensData) => void
  label?: string
}

export function TokenSelector({ selectedToken, onSelectToken, label = 'Select Token' }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { tokens } = useStrategies();

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectToken = (token: TokensData) => {
    onSelectToken(token)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        {selectedToken ? (
          <div className="flex items-center gap-2">
            {selectedToken.logo && (
              <img
                src={selectedToken.logo}
                alt={selectedToken.symbol}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span>{selectedToken.symbol}</span>
          </div>
        ) : (
          <span>{label}</span>
        )}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 w-full z-50 rounded-lg border bg-background shadow-lg">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredTokens.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No tokens found
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleSelectToken(token)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                  >
                    {token.logo && (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
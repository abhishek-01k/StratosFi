import React from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { TokensData } from '@/types/tokens.types';
import { Button } from '@/components/ui/button';

interface TokensModalComponentProps {
    tokens: TokensData[],
    selectedToken?: TokensData;
    onSelectToken: (token: TokensData) => void;
}

const TokensModalComponent: React.FC<TokensModalComponentProps> = ({ tokens, selectedToken, onSelectToken }) => {
    const { chainId } = useAccount();
    console.log("tokens", tokens);
    console.log("selectedToken", selectedToken);

    return (
        <div className="max-h-80 space-y-2 overflow-y-auto">
            {tokens.map((token: TokensData) => {
                const isSelected = selectedToken && selectedToken.address === token.address;
                return (
                    <Button
                        key={token.address}
                        variant={isSelected ? 'secondary' : 'ghost'}
                        className={`flex w-full items-center justify-start gap-2 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => onSelectToken(token)}
                    >
                        <Image
                            src={token.logo}
                            alt={token.symbol}
                            width={20}
                            height={20}
                            className="rounded-full"
                        />
                        <span className="font-semibold">{token.symbol}</span>
                        <span className="text-muted-foreground">- {token.name}</span>
                    </Button>
                );
            })}
        </div>
    );
};

export default TokensModalComponent;
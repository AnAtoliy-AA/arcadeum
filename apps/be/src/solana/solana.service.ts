import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import { ConfigService } from '@nestjs/config';
import { getPlatformKeypair } from './lib/solana-keypair';
import {
  ARCADEUM_MINT_ADDRESS,
  toRawAmount,
  fromRawAmount,
} from './lib/arcadeum-token';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;

  constructor(private readonly config: ConfigService) {
    const rpcUrl =
      this.config.get<string>('SOLANA_RPC_URL') ??
      'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getPlatformBalance(): Promise<{ sol: number; arcadeum: number }> {
    const keypair = getPlatformKeypair();
    const solBalance = await this.connection.getBalance(keypair.publicKey);

    let arcadeumBalance = 0;
    try {
      const ata = await getAssociatedTokenAddress(
        ARCADEUM_MINT_ADDRESS,
        keypair.publicKey,
      );
      const account = await getAccount(this.connection, ata);
      arcadeumBalance = fromRawAmount(account.amount);
    } catch {
      this.logger.warn('Platform wallet has no ARCADEUM token account');
    }

    return {
      sol: solBalance / LAMPORTS_PER_SOL,
      arcadeum: arcadeumBalance,
    };
  }

  async transferArcadeum(
    recipientAddress: string,
    amount: number,
  ): Promise<string> {
    const keypair = getPlatformKeypair();
    const recipient = new PublicKey(recipientAddress);
    const rawAmount = toRawAmount(amount);

    const fromAta = await getAssociatedTokenAddress(
      ARCADEUM_MINT_ADDRESS,
      keypair.publicKey,
    );
    const toAta = await getAssociatedTokenAddress(
      ARCADEUM_MINT_ADDRESS,
      recipient,
    );

    const transaction = new Transaction().add(
      createTransferInstruction(fromAta, toAta, keypair.publicKey, rawAmount),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = keypair.publicKey;
    transaction.sign(keypair);

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
    );

    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    this.logger.log(
      `Transferred ${amount} ARCADEUM to ${recipientAddress}: ${signature}`,
    );
    return signature;
  }

  async transferSol(
    recipientAddress: string,
    lamports: number,
  ): Promise<string> {
    const keypair = getPlatformKeypair();
    const recipient = new PublicKey(recipientAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: recipient,
        lamports,
      }),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = keypair.publicKey;
    transaction.sign(keypair);

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
    );

    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    this.logger.log(
      `Transferred ${lamports} lamports to ${recipientAddress}: ${signature}`,
    );
    return signature;
  }
}

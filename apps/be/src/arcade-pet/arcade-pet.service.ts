import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  applyDeterministicDecay,
  createInitialPet,
  executePetAction,
  type ArcadePetActionResult,
  type GameTreatId,
  type PetState,
} from '@arcadeum/games-core';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { ArcadePet, type ArcadePetDocument } from './schemas/arcade-pet.schema';
import type { HatchPetDto, PetActionDto } from './dto/arcade-pet.dto';

@Injectable()
export class ArcadePetService {
  constructor(
    @InjectModel(ArcadePet.name, OCI_CONNECTION)
    private readonly petModel: Model<ArcadePetDocument>,
  ) {}

  private docToState(doc: ArcadePetDocument): PetState {
    const rawInv = doc.inventory;
    const inventory: Record<GameTreatId, number> = {
      chess_cookie: 0,
      sea_battle_fish: 0,
      hearts_candy: 0,
      critical_pepper: 0,
      pachisi_spice: 0,
    };

    if (rawInv instanceof Map) {
      for (const [k, v] of rawInv.entries()) {
        inventory[k] = v;
      }
    } else if (rawInv && typeof rawInv === 'object') {
      const rec = rawInv as Record<string, number>;
      for (const k of Object.keys(inventory)) {
        if (typeof rec[k] === 'number') {
          inventory[k as GameTreatId] = rec[k];
        }
      }
    }

    return {
      id: doc._id.toString(),
      name: doc.name,
      species: doc.species,
      stage: doc.stage,
      theme: doc.theme,
      stats: {
        hunger: doc.stats.hunger,
        happiness: doc.stats.happiness,
        energy: doc.stats.energy,
        hygiene: doc.stats.hygiene,
        discipline: doc.stats.discipline,
        health: doc.stats.health,
        weight: doc.stats.weight,
        level: doc.stats.level,
        xp: doc.stats.xp,
      },
      timestamps: {
        bornAt: doc.timestamps.bornAt,
        lastInteractedAt: doc.timestamps.lastInteractedAt,
        lastFedAt: doc.timestamps.lastFedAt,
        lastSleptAt: doc.timestamps.lastSleptAt,
        lastCleanedAt: doc.timestamps.lastCleanedAt,
        lastTrainedAt: doc.timestamps.lastTrainedAt,
      },
      isSleeping: doc.isSleeping,
      poopCount: doc.poopCount,
      isSick: doc.isSick,
      inventory,
      careMistakes: doc.careMistakes,
      mood: doc.mood,
    };
  }

  private applyStateToDoc(doc: ArcadePetDocument, state: PetState): void {
    doc.name = state.name;
    doc.species = state.species;
    doc.stage = state.stage;
    doc.theme = state.theme;
    doc.stats = {
      hunger: state.stats.hunger,
      happiness: state.stats.happiness,
      energy: state.stats.energy,
      hygiene: state.stats.hygiene,
      discipline: state.stats.discipline,
      health: state.stats.health,
      weight: state.stats.weight,
      level: state.stats.level,
      xp: state.stats.xp,
    };
    doc.timestamps = {
      bornAt: state.timestamps.bornAt,
      lastInteractedAt: state.timestamps.lastInteractedAt,
      lastFedAt: state.timestamps.lastFedAt,
      lastSleptAt: state.timestamps.lastSleptAt,
      lastCleanedAt: state.timestamps.lastCleanedAt,
      lastTrainedAt: state.timestamps.lastTrainedAt,
    };
    doc.isSleeping = state.isSleeping;
    doc.poopCount = state.poopCount;
    doc.isSick = state.isSick;
    doc.careMistakes = state.careMistakes;
    doc.mood = state.mood;

    const map = new Map<GameTreatId, number>();
    for (const [k, v] of Object.entries(state.inventory)) {
      map.set(k as GameTreatId, v);
    }
    doc.inventory = map;
  }

  async getOrCreatePet(userId: string): Promise<PetState> {
    const userObjectId = new Types.ObjectId(userId);
    let doc = await this.petModel.findOne({ userId: userObjectId });

    if (!doc) {
      const initial = createInitialPet({
        id: new Types.ObjectId().toString(),
        name: 'ArcadePet',
      });
      doc = new this.petModel({
        _id: new Types.ObjectId(initial.id),
        userId: userObjectId,
        name: initial.name,
        species: initial.species,
        stage: initial.stage,
        theme: initial.theme,
        stats: initial.stats,
        timestamps: initial.timestamps,
        isSleeping: initial.isSleeping,
        poopCount: initial.poopCount,
        isSick: initial.isSick,
        inventory: new Map(Object.entries(initial.inventory)),
        careMistakes: initial.careMistakes,
        mood: initial.mood,
      });
      await doc.save();
      return initial;
    }

    const state = this.docToState(doc);
    const updated = applyDeterministicDecay(state);
    if (
      updated.timestamps.lastInteractedAt !== state.timestamps.lastInteractedAt
    ) {
      this.applyStateToDoc(doc, updated);
      await doc.save();
    }
    return updated;
  }

  async hatchPet(userId: string, dto: HatchPetDto): Promise<PetState> {
    const userObjectId = new Types.ObjectId(userId);
    const doc = await this.petModel.findOne({ userId: userObjectId });
    if (!doc) {
      throw new NotFoundException('Pet not found');
    }

    const current = this.docToState(doc);
    const result = executePetAction(current, 'hatch', {
      species: dto.species,
      theme: dto.theme,
    });

    if (!result.success) {
      throw new BadRequestException(result.messageCode);
    }

    result.state.name = dto.name;
    this.applyStateToDoc(doc, result.state);
    await doc.save();
    return result.state;
  }

  async executeAction(
    userId: string,
    dto: PetActionDto,
  ): Promise<ArcadePetActionResult> {
    const userObjectId = new Types.ObjectId(userId);
    const doc = await this.petModel.findOne({ userId: userObjectId });
    if (!doc) {
      throw new NotFoundException('Pet not found');
    }

    const current = this.docToState(doc);
    const result = executePetAction(current, dto.action, {
      treatId: dto.treatId,
      theme: dto.theme,
    });

    if (result.success) {
      this.applyStateToDoc(doc, result.state);
      await doc.save();
    }

    return result;
  }

  async rewardTreat(userId: string, treatId: GameTreatId): Promise<PetState> {
    const userObjectId = new Types.ObjectId(userId);
    let doc = await this.petModel.findOne({ userId: userObjectId });
    if (!doc) {
      await this.getOrCreatePet(userId);
      doc = await this.petModel.findOne({ userId: userObjectId });
      if (!doc) throw new NotFoundException('Pet creation failed');
    }

    const current = this.docToState(doc);
    const count = current.inventory[treatId] ?? 0;
    current.inventory[treatId] = count + 1;
    this.applyStateToDoc(doc, current);
    await doc.save();
    return current;
  }
}



export type Monster = {
  index: string;
  name: string;
  url: string;
};

export type AbilityScore = {
    name: "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
    score: number;
}

export type Action = {
    name: string;
    desc: string;
    attack_bonus?: number;
    damage?: { damage_dice: string, damage_type: { name: string } }[];
}

export type MonsterDetails = {
    index: string;
    name: string;
    challenge_rating: number;
    xp: number;
    size: string;
    type: string;
    alignment: string;
    image?: string;
    
    armor_class: Array<{value: number, type: string}>;
    hit_points: number;
    hit_dice: string;
    speed: Record<string, string>;
    
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    
    proficiencies: Array<{proficiency: {name: string, url: string}, value: number}>;
    
    damage_vulnerabilities: string[];
    damage_resistances: string[];
    damage_immunities: string[];
    condition_immunities: Array<{name: string, url: string}>;

    senses: Record<string, string>;
    languages: string;

    special_abilities: Action[];
    actions: Action[];
    legendary_actions: Action[];
}

'use strict';

// map java sound names to bedrock and add additional metadata
module.exports = {
  'block.ancient_debris.break': {
    adjustments: { pitch: 11 / 12 },
    /* dig.ancient_debris is also used for placing debris */
    name: 'poofsounds.dabriss.break',
    propOverrides: { category: 'block' },
  },
  'block.barrel.open': {
    adjustments: { pitch: 20 / 21 },
    name: 'block.barrel.open',
  },
  'block.bell.use': { name: 'block.bell.hit' },
  'block.bubble_column.upwards_ambient': { name: 'bubble.up' },
  'block.bubble_column.upwards_inside': { name: 'bubble.upinside' },
  'block.bubble_column.whirlpool_ambient': { name: 'bubble.down' },
  'block.bubble_column.whirlpool_inside': { name: 'bubble.downinside' },
  'block.chest.open': { name: 'random.chestopen' },
  'block.decorated_pot.insert': { name: 'block.decorated_pot.insert' },
  'block.end_gateway.spawn': [
    /* no bedrock equivalent */
  ],
  'block.end_portal.spawn': { name: 'block.end_portal.spawn' },
  'block.ender_chest.open': { name: 'random.enderchestopen' },
  'block.portal.travel': { name: 'portal.travel' },
  'block.portal.trigger': { name: 'portal.trigger' },
  'block.shulker_box.open': { name: 'random.shulkerboxopen' },
  'entity.axolotl.splash': { name: 'mob.axolotl.splash' },
  'entity.blaze.shoot': { name: 'mob.blaze.shoot' },
  'entity.bogged.ambient': { name: 'mob.bogged.ambient' },
  'entity.bogged.death': { name: 'mob.bogged.death' },
  'entity.cat.ambient': { name: 'mob.cat.meow' },
  'entity.cat.stray_ambient': { name: 'mob.cat.straymeow' },
  'entity.cow.ambient': { name: 'mob.cow.say' },
  'entity.cow.milk': { name: 'mob.cow.milk' },
  'entity.creeper.primed': [
    {
      /* prevent conflict with random.fuse which is used for tnt */
      name: 'poofsounds.creeper.sss',
      propOverrides: { category: 'block' },
    },
    { adjustments: { pitch: 0.5 * 1.2 }, name: 'note.creeper' },
  ],
  'entity.dolphin.splash': { name: 'mob.dolphin.splash' },
  'entity.donkey.ambient': { name: 'mob.horse.donkey.idle' },
  'entity.dragon_fireball.explode': [
    /* no bedrock equivalent */
  ],
  'entity.ender_dragon.death': {
    adjustments: { volume: 8 },
    name: 'mob.enderdragon.death',
  },
  'entity.ender_dragon.shoot': [
    /* no bedrock equivalent */
  ],
  'entity.enderman.stare': { name: 'mob.endermen.stare' },
  'entity.evoker_fangs.attack': { name: 'mob.evocation_fangs.attack' },
  'entity.fishing_bobber.splash': [
    {
      /* only usage in java, but reused in bedrock */
      name: 'random.splash',
    },
    { adjustments: { volume: 0.1 }, name: 'cauldron.adddye' },
    { adjustments: { volume: 0.1 }, name: 'cauldron.cleanarmor' },
    { adjustments: { volume: 0.1 }, name: 'cauldron.cleanbanner' },
    { adjustments: { volume: 0.1 }, name: 'cauldron.dyearmor' },
    { adjustments: { volume: 0.1 }, name: 'cauldron.fillpotion' },
    { adjustments: { volume: 0.1 }, name: 'cauldron.fillwater' },
    { adjustments: { volume: 0.1 }, name: 'cauldron.takepotion' },
    { adjustments: { volume: 0.1 }, name: 'cauldron.takewater' },
  ],
  'entity.frog.ambient': { name: 'mob.frog.ambient' },
  'entity.generic.eat': { name: 'random.eat' },
  'entity.generic.explode': {
    adjustments: { pitch: 20 / 29 },
    name: 'random.explode',
  },
  'entity.generic.splash': [
    /* uses random.splash, which is an older version in bedrock */
  ],
  'entity.ghast.shoot': { name: 'mob.ghast.fireball' },
  'entity.ghast.warn': { name: 'mob.ghast.charge' },
  'entity.glow_squid.ambient': { name: 'mob.glow_squid.ambient' },
  'entity.glow_squid.death': { name: 'mob.glow_squid.death' },
  'entity.glow_squid.hurt': { name: 'mob.glow_squid.hurt' },
  'entity.goat.death': { name: 'mob.goat.death' },
  'entity.goat.milk': [
    /* mapped to mob.mooshroom.suspicious_milk */
  ],
  'entity.goat.screaming.ambient': { name: 'mob.goat.ambient.screamer' },
  'entity.goat.screaming.death': { name: 'mob.goat.death.screamer' },
  'entity.goat.screaming.eat': [
    /* no bedrock equivalent */
  ],
  'entity.goat.screaming.hurt': { name: 'mob.goat.hurt.screamer' },
  'entity.goat.screaming.long_jump': [
    /* no bedrock equivalent */
  ],
  'entity.goat.screaming.milk': { name: 'mob.goat.milk.screamer' },
  'entity.goat.screaming.prepare_ram': {
    name: 'mob.goat.prepare_ram.screamer',
  },
  'entity.horse.ambient': { name: 'mob.horse.idle' },
  'entity.hostile.splash': [
    /* uses random.splash */
  ],
  'entity.item.break': { adjustments: { pitch: 10 / 9 }, name: 'random.break' },
  'entity.lightning_bolt.impact': {
    adjustments: { pitch: 11 / 10 },
    name: 'ambient.weather.lightning.impact',
  },
  'entity.lightning_bolt.thunder': {
    adjustments: { pitch: 21 / 20 },
    name: 'ambient.weather.thunder',
  },
  'entity.llama.ambient': { name: 'mob.llama.idle' },
  'entity.mooshroom.milk': [
    /* mapped to mob.mooshroom.suspicious_milk */
  ],
  'entity.mooshroom.suspicious_milk': { name: 'mob.mooshroom.suspicious_milk' },
  'entity.mule.ambient': [
    /* bedrock uses donkey sounds for mule */
  ],
  'entity.ocelot.ambient': { name: 'mob.ocelot.idle' },
  'entity.panda.sneeze': { name: 'mob.panda.sneeze' },
  'entity.parrot.ambient': { name: 'mob.parrot.idle' },
  'entity.pig.ambient': { name: 'mob.pig.say' },
  'entity.pig.hurt': [
    /* uses mob.pig.say */
  ],
  'entity.piglin.ambient': [
    { name: 'mob.piglin.ambient' },
    { adjustments: { pitch: 1.2 }, name: 'note.piglin' },
  ],
  'entity.piglin.retreat': { name: 'mob.piglin.retreat' },
  'entity.piglin_brute.ambient': { name: 'mob.piglin_brute.ambient' },
  'entity.pillager.ambient': { name: 'mob.pillager.idle' },
  'entity.pillager.hurt': { name: 'mob.pillager.hurt' },
  'entity.player.burp': { name: 'random.burp' },
  'entity.player.death': { name: 'game.player.die' },
  'entity.player.hurt': { name: 'game.player.hurt' },
  'entity.player.hurt_drown': { name: 'mob.player.hurt_drown' },
  'entity.player.hurt_freeze': { name: 'mob.player.hurt_freeze' },
  'entity.player.hurt_on_fire': { name: 'mob.player.hurt_on_fire' },
  'entity.player.hurt_sweet_berry_bush': {
    name: 'block.sweet_berry_bush.hurt',
  },
  'entity.player.splash': [
    /* uses random.splash */
  ],
  'entity.player.splash.high_speed': [
    /* no bedrock equivalent */
  ],
  'entity.sheep.ambient': { name: 'mob.sheep.say' },
  'entity.sheep.death': [
    /* uses mob.sheep.say */
  ],
  'entity.sheep.hurt': [
    /* uses mob.sheep.say */
  ],
  'entity.shulker.ambient': { name: 'mob.shulker.ambient' },
  'entity.skeleton.ambient': [
    { name: 'mob.skeleton.say' },
    { adjustments: { pitch: 1.2 }, name: 'note.skeleton' },
  ],
  'entity.skeleton.death': { name: 'mob.skeleton.death' },
  'entity.spider.ambient': { name: 'mob.spider.say' },
  'entity.spider.death': { name: 'mob.spider.death' },
  'entity.spider.hurt': [
    /* uses mob.spider.say */
  ],
  'entity.spider.step': {
    adjustments: { volume: 0.5 },
    name: 'mob.spider.step',
  },
  'entity.squid.ambient': { name: 'mob.squid.ambient' },
  'entity.squid.death': { name: 'mob.squid.death' },
  'entity.squid.hurt': { name: 'mob.squid.hurt' },
  'entity.stray.ambient': { name: 'mob.stray.ambient' },
  'entity.stray.death': { name: 'mob.stray.death' },
  'entity.tadpole.grow_up': { name: 'mob.tadpole.convert_to_frog' },
  'entity.villager.ambient': { name: 'mob.villager.idle' },
  'entity.villager.celebrate': [
    /* no bedrock equivalent */
  ],
  'entity.villager.death': { name: 'mob.villager.death' },
  'entity.villager.hurt': { name: 'mob.villager.hit' },
  'entity.villager.no': { name: 'mob.villager.no' },
  'entity.villager.trade': { name: 'mob.villager.haggle' },
  'entity.villager.yes': { name: 'mob.villager.yes' },
  'entity.vindicator.ambient': { name: 'mob.vindicator.idle' },
  'entity.vindicator.death': { name: 'mob.vindicator.death' },
  'entity.wandering_trader.ambient': { name: 'mob.wanderingtrader.idle' },
  'entity.wandering_trader.death': { name: 'mob.wanderingtrader.death' },
  'entity.wandering_trader.hurt': { name: 'mob.wanderingtrader.hurt' },
  'entity.wandering_trader.no': { name: 'mob.wanderingtrader.no' },
  'entity.wandering_trader.trade': { name: 'mob.wanderingtrader.haggle' },
  'entity.wandering_trader.yes': { name: 'mob.wanderingtrader.yes' },
  'entity.witch.ambient': { name: 'mob.witch.ambient' },
  'entity.wither.death': { name: 'mob.wither.death' },
  'entity.wither.spawn': { name: 'mob.wither.spawn' },
  'entity.wither_skeleton.ambient': [
    { name: 'entity.wither_skeleton.ambient' },
    { adjustments: { pitch: 1.2 }, name: 'note.witherskeleton' },
  ],
  'entity.wither_skeleton.death': { name: 'entity.wither_skeleton.death' },
  'entity.wolf.ambient': { name: 'mob.wolf.bark' },
  'entity.wolf_angry.ambient': { name: 'mob.wolf.mad.bark' },
  'entity.wolf_big.ambient': { name: 'mob.wolf.big.bark' },
  'entity.wolf_cute.ambient': { name: 'mob.wolf.cute.bark' },
  'entity.wolf_grumpy.ambient': { name: 'mob.wolf.grumpy.bark' },
  'entity.wolf_puglin.ambient': { name: 'mob.wolf.puglin.bark' },
  'entity.wolf_sad.ambient': { name: 'mob.wolf.sad.bark' },
  'entity.zombie.ambient': [
    { name: 'mob.zombie.say' },
    { adjustments: { pitch: 1.2 }, name: 'note.zombie' },
  ],
  'entity.zombie.hurt': { name: 'mob.zombie.hurt' },
  'entity.zombified_piglin.hurt': { name: 'mob.zombiepig.zpighurt' },
  'event.mob_effect.bad_omen': { name: 'apply_effect.bad_omen' },
  'item.armor.equip_diamond': { name: 'armor.equip_diamond' },
  'item.armor.equip_elytra': {
    /* prevent mapping to regular leather armor */
    name: 'poofsounds.equip_elytra',
    propOverrides: { category: 'player' },
  },
  'item.axe.strip': [
    { adjustments: { pitch: 12 / 10 }, name: 'use.stem' },
    { adjustments: { pitch: 12 / 10 }, name: 'use.wood' },
  ],
  'item.bundle.insert': { name: 'bundle.insert' },
  'item.elytra.flying': { name: 'elytra.loop' },
  'item.firecharge.use': [
    /* no bedrock equivalent */
  ],
  'item.shield.block': { name: 'item.shield.block' },
  'item.shield.break': [
    /* uses random.break */
  ],
  'item.totem.use': { name: 'random.totem' },
  'ui.hud.bubble_pop': { name: 'hud.bubble.pop' },
};

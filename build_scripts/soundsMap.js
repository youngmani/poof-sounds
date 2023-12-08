// map java sound names to bedrock and add additional metadata
module.exports = {
  'block.ancient_debris.break': {
    name: 'dig.ancient_debris',
    pitchAdjust: 11 / 12,
  },
  'block.barrel.open': {
    name: 'block.barrel.open',
    pitchAdjust: 1 / 1.05,
  },
  'block.bell.use': {
    name: 'block.bell.hit',
  },
  'block.chest.open': {
    name: 'random.chestopen',
  },
  'block.decorated_pot.insert': {
    name: 'block.decorated_pot.insert',
  },
  'block.end_portal.spawn': {
    name: 'block.end_portal.spawn',
  },
  'block.ender_chest.open': {
    name: 'random.enderchestopen',
  },
  'block.portal.travel': {
    name: 'portal.travel',
  },
  'block.portal.trigger': {
    name: 'portal.trigger',
  },
  'block.shulker_box.open': {
    name: 'random.shulkerboxopen',
  },
  'entity.cat.ambient': {
    name: 'mob.cat.meow',
  },
  'entity.cat.stray_ambient': {
    name: 'mob.cat.straymeow',
  },
  'entity.cow.ambient': {
    name: 'mob.cow.say',
  },
  'entity.creeper.primed': {
    name: 'random.fuse',
    /* prevent conflict with random.fuse which is used for tnt */
    poofName: 'poofsounds.creeper.sss',
    propOverrides: {
      category: 'block',
    },
  },
  'entity.donkey.ambient': {
    name: 'mob.horse.donkey.idle',
  },
  'entity.ender_dragon.death': {
    name: 'mob.enderdragon.death',
  },
  'entity.enderman.stare': {
    name: 'mob.endermen.stare',
  },
  'entity.evoker_fangs.attack': {
    name: 'mob.evocation_fangs.attack',
  },
  'entity.frog.ambient': {
    name: 'mob.frog.ambient',
  },
  'entity.generic.eat': {
    name: 'random.eat',
  },
  'entity.generic.explode': {
    name: 'random.explode',
    pitchAdjust: 2 / 3,
  },
  'entity.ghast.warn': {
    name: 'mob.ghast.charge',
  },
  'entity.glow_squid.ambient': {
    name: 'mob.glow_squid.ambient',
  },
  'entity.glow_squid.death': {
    name: 'mob.glow_squid.death',
  },
  'entity.glow_squid.hurt': {
    name: 'mob.glow_squid.hurt',
  },
  'entity.horse.ambient': {
    name: 'mob.horse.idle',
  },
  'entity.item.break': {
    name: 'random.break',
    pitchAdjust: 1 / 0.9,
  },
  'entity.lightning_bolt.thunder': {
    name: 'ambient.weather.thunder',
    pitchAdjust: 1.05,
  },
  'entity.ocelot.ambient': {
    name: 'mob.ocelot.idle',
  },
  'entity.pig.ambient': {
    name: 'mob.pig.say',
  },
  'entity.pig.hurt': {
    /* uses mob.pig.say */
    name: null,
  },
  'entity.piglin.ambient': {
    name: 'mob.piglin.ambient',
  },
  'entity.piglin.retreat': {
    name: 'mob.piglin.retreat',
  },
  'entity.piglin_brute.ambient': {
    name: 'mob.piglin_brute.ambient',
  },
  'entity.pillager.ambient': {
    name: 'mob.pillager.idle',
  },
  'entity.pillager.hurt': {
    name: 'mob.pillager.hurt',
  },
  'entity.player.burp': {
    name: 'random.burp',
  },
  'entity.player.death': {
    name: 'game.player.die',
  },
  'entity.player.hurt': {
    name: 'game.player.hurt',
  },
  'entity.player.hurt_drown': {
    name: 'mob.player.hurt_drown',
  },
  'entity.player.hurt_freeze': {
    name: 'mob.player.hurt_freeze',
  },
  'entity.player.hurt_on_fire': {
    name: 'mob.player.hurt_on_fire',
  },
  'entity.player.hurt_sweet_berry_bush': {
    name: 'block.sweet_berry_bush.hurt',
  },
  'entity.sheep.ambient': {
    name: 'mob.sheep.say',
  },
  'entity.sheep.death': {
    /* uses mob.sheep.say */
    name: null,
  },
  'entity.sheep.hurt': {
    /* uses mob.sheep.say */
    name: null,
  },
  'entity.shulker.ambient': {
    name: 'mob.shulker.ambient',
  },
  'entity.skeleton.ambient': {
    name: 'mob.skeleton.say',
  },
  'entity.skeleton.death': {
    name: 'mob.skeleton.death',
  },
  'entity.spider.ambient': {
    name: 'mob.spider.say',
  },
  'entity.spider.death': {
    name: 'mob.spider.death',
  },
  'entity.spider.hurt': {
    /* uses mob.spider.say */
    name: null,
  },
  'entity.squid.ambient': {
    name: 'mob.squid.ambient',
  },
  'entity.squid.death': {
    name: 'mob.squid.death',
  },
  'entity.squid.hurt': {
    name: 'mob.squid.hurt',
  },
  'entity.stray.ambient': {
    name: 'mob.stray.ambient',
  },
  'entity.stray.death': {
    name: 'mob.stray.death',
  },
  'entity.villager.ambient': {
    name: 'mob.villager.idle',
  },
  'entity.villager.celebrate': {
    name: null,
  },
  'entity.villager.death': {
    name: 'mob.villager.death',
  },
  'entity.villager.hurt': {
    name: 'mob.villager.hit',
  },
  'entity.villager.no': {
    name: 'mob.villager.no',
  },
  'entity.villager.trade': {
    name: 'mob.villager.haggle',
  },
  'entity.villager.yes': {
    name: 'mob.villager.yes',
  },
  'entity.vindicator.ambient': {
    name: 'mob.vindicator.idle',
  },
  'entity.vindicator.death': {
    name: 'mob.vindicator.death',
  },
  'entity.wandering_trader.ambient': {
    name: 'mob.wanderingtrader.idle',
  },
  'entity.wandering_trader.death': {
    name: 'mob.wanderingtrader.death',
  },
  'entity.wandering_trader.hurt': {
    name: 'mob.wanderingtrader.hurt',
  },
  'entity.wandering_trader.no': {
    name: 'mob.wanderingtrader.no',
  },
  'entity.wandering_trader.trade': {
    name: 'mob.wanderingtrader.haggle',
  },
  'entity.wandering_trader.yes': {
    name: 'mob.wanderingtrader.yes',
  },
  'entity.witch.ambient': {
    name: 'mob.witch.ambient',
  },
  'entity.wither_skeleton.ambient': {
    name: 'entity.wither_skeleton.ambient',
  },
  'entity.wither_skeleton.death': {
    name: 'entity.wither_skeleton.death',
  },
  'entity.wolf.ambient': {
    name: 'mob.wolf.bark',
  },
  'entity.zombie.ambient': {
    name: 'mob.zombie.say',
  },
  'entity.zombie.hurt': {
    name: 'mob.zombie.hurt',
  },
  'entity.zombified_piglin.hurt': {
    name: 'mob.zombiepig.zpighurt',
  },
  'item.axe.strip': {
    additionalNames: ['use.stem'],
    name: 'use.wood',
    pitchAdjust: 1.2,
  },
  'item.bundle.insert': {
    name: null,
  },
  'item.shield.block': {
    name: 'item.shield.block',
  },
  'item.shield.break': {
    /* uses random.break */
    name: null,
  },
  'item.totem.use': {
    name: 'random.totem',
  },
};

M=Game.ObjectsById[7].minigame
cg_spellCastTotal = M.spellsCastTotal

// variables
max_clickfrenzy = 10
max_sugarlump = 2
found_clickfrenzy = 0
found_sugarlump = 0

castSpell=function(obj)
{
	spell=M.spells["hand of fate"]
    var obj=obj||{};
    var out=0;
    var cost=0;
    var fail=false;
    if (typeof obj.cost!=='undefined') cost=obj.cost; else cost=M.getSpellCost(spell);
    var failChance=M.getFailChance(spell);
    if (typeof obj.failChanceSet!=='undefined') failChance=obj.failChanceSet;
    if (typeof obj.failChanceAdd!=='undefined') failChance+=obj.failChanceAdd;
    if (typeof obj.failChanceMult!=='undefined') failChance*=obj.failChanceMult;
    if (typeof obj.failChanceMax!=='undefined') failChance=Math.max(failChance,obj.failChanceMax);
    Math.seedrandom(Game.seed+'/'+cg_spellCastTotal);
    if (!spell.fail || Math.random()<(1-failChance)) 
				{
					var choices=[];
                    choices.push('frenzy','multiply cookies');
                    if (!Game.hasBuff('Dragonflight')) choices.push('click frenzy');
                    if (Math.random()<0.1) choices.push('cookie storm','cookie storm','blab');
                    if (Game.BuildingsOwned>=10 && Math.random()<0.25) choices.push('building special');
                    //if (Math.random()<0.2) choices.push('clot','cursed finger','ruin cookies');
                    if (Math.random()<0.15) choices=['cookie storm drop'];
                    if (Math.random()<0.0001) choices.push('free sugar lump');
                    choice = choose(choices)
                    if (!(found_clickfrenzy==max_clickfrenzy) && choice=='click frenzy')
                    {
                    	found_clickfrenzy += 1
                    	console.log("Next " + choice + " at: " + cg_spellCastTotal);
                	}
                    else if (!(found_sugarlump==max_sugarlump) && choice=='free sugar lump')
                    {
                    	found_sugarlump += 1
                    	console.log("Next " + choice + " at: " + cg_spellCastTotal);
                    }
                    out = 1
				} 
				else 
				{
					var choices=[];
                    choices.push('clot','ruin cookies');
                    if (Math.random()<0.1) choices.push('cursed finger','blood frenzy');
                    if (Math.random()<0.003) choices.push('free sugar lump');
                    if (Math.random()<0.1) choices=['blab'];
                    choice = choose(choices)
                    if (!(found_clickfrenzy==max_clickfrenzy) && choice=='click frenzy')
                    {
                    	found_clickfrenzy += 1
                    	console.log("Next " + choice + " at: " + cg_spellCastTotal);
                	}
                    else if (!(found_sugarlump==max_sugarlump) && choice=='free sugar lump')
                    {
                    	found_sugarlump += 1
                    	console.log("Next " + choice + " at: " + cg_spellCastTotal);
                    }
                    out = 1
				}
    Math.seedrandom();
    if (out!=-1)
    {
        if (!spell.passthrough && !obj.passthrough)
        {
            cg_spellCastTotal++;
        }
                        
        var rect=l('grimoireSpell'+spell.id).getBoundingClientRect();
        Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);
        
    }
}


while (!(found_clickfrenzy==max_clickfrenzy) || !(found_sugarlump==max_sugarlump))
{
	castSpell();
}

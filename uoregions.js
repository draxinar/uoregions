'use strict';

/* ===================================================================
 *  CONSTANTS
 * =================================================================== */
const MAP_W = 6144,
	MAP_H = 4096;
const HANDLE_SIZE = 8; // screen pixels
const MIN_ZOOM = 0.02,
	MAX_ZOOM = 12;
const DRAG_THRESHOLD = 3; // screen pixels before drag begins

/* ===================================================================
 *  MUSIC TRACKS  (UO client.exe music table, packet 0x6D IDs)
 *  49 entries, indexed by ID. 0 also doubles as the "no music" sentinel.
 * =================================================================== */
const MUSIC_TRACKS = [
	{ id: 0, file: 'oldult01.mid', name: 'Ultima theme 1' },
	{ id: 1, file: 'create1.mid', name: 'Character creation' },
	{ id: 2, file: 'dragflit.mid', name: 'Dragon flight' },
	{ id: 3, file: 'oldult02.mid', name: 'Ultima theme 2' },
	{ id: 4, file: 'oldult03.mid', name: 'Ultima theme 3' },
	{ id: 5, file: 'oldult04.mid', name: 'Ultima theme 4' },
	{ id: 6, file: 'oldult05.mid', name: 'Ultima theme 5' },
	{ id: 7, file: 'oldult06.mid', name: 'Ultima theme 6' },
	{ id: 8, file: 'stones2.mid', name: 'Stones' },
	{ id: 9, file: 'britain1.mid', name: 'Britain 1' },
	{ id: 10, file: 'britain2.mid', name: 'Britain 2' },
	{ id: 11, file: 'bucsden.mid', name: "Buccaneer's Den" },
	{ id: 12, file: 'jhelom.mid', name: 'Jhelom' },
	{ id: 13, file: 'lbcastle.mid', name: "Lord British's Castle" },
	{ id: 14, file: 'linelle.mid', name: 'Linelle' },
	{ id: 15, file: 'magincia.mid', name: 'Magincia' },
	{ id: 16, file: 'minoc.mid', name: 'Minoc' },
	{ id: 17, file: 'ocllo.mid', name: 'Ocllo' },
	{ id: 18, file: 'samlethe.mid', name: 'Sam Lethe' },
	{ id: 19, file: 'serpents.mid', name: "Serpent's Hold" },
	{ id: 20, file: 'skarabra.mid', name: 'Skara Brae' },
	{ id: 21, file: 'trinsic.mid', name: 'Trinsic' },
	{ id: 22, file: 'vesper.mid', name: 'Vesper' },
	{ id: 23, file: 'wind.mid', name: 'Wind' },
	{ id: 24, file: 'yew.mid', name: 'Yew' },
	{ id: 25, file: 'cave01.mid', name: 'Cave/Dungeon 1' },
	{ id: 26, file: 'dungeon9.mid', name: 'Dungeon 2' },
	{ id: 27, file: 'forest_a.mid', name: 'Forest' },
	{ id: 28, file: 'intown01.mid', name: 'Generic town' },
	{ id: 29, file: 'jungle_a.mid', name: 'Jungle' },
	{ id: 30, file: 'mountn_a.mid', name: 'Mountain' },
	{ id: 31, file: 'plains_a.mid', name: 'Plains' },
	{ id: 32, file: 'sailing.mid', name: 'Sailing' },
	{ id: 33, file: 'swamp_a.mid', name: 'Swamp' },
	{ id: 34, file: 'tavern01.mid', name: 'Tavern 1' },
	{ id: 35, file: 'tavern02.mid', name: 'Tavern 2' },
	{ id: 36, file: 'tavern03.mid', name: 'Tavern 3' },
	{ id: 37, file: 'tavern04.mid', name: 'Tavern 4' },
	{ id: 38, file: 'combat1.mid', name: 'Combat 1' },
	{ id: 39, file: 'combat2.mid', name: 'Combat 2' },
	{ id: 40, file: 'combat3.mid', name: 'Combat 3' },
	{ id: 41, file: 'approach.mid', name: 'Approach' },
	{ id: 42, file: 'death.mid', name: 'Death' },
	{ id: 43, file: 'victory.mid', name: 'Victory' },
	{ id: 44, file: 'btcastle.mid', name: "Blackthorn's Castle" },
	{ id: 45, file: 'nujelm.mid', name: "Nujel'm" },
	{ id: 46, file: 'dungeon2.mid', name: 'Dungeon 3' },
	{ id: 47, file: 'cove.mid', name: 'Cove' },
	{ id: 48, file: 'moonglow.mid', name: 'Moonglow' },
];

/* ===================================================================
 *  REGION TYPES  (dungeon entrance, used by GetLocalizedDesc).
 *  9 entries, 0 = none, 1-8 = Destard/Covetous/Shame/Wrong/Despise/
 *  Doom/Hythloth/Hythloth-alias.
 * =================================================================== */
const REGION_TYPES = [
	{ id: 0, name: 'none' },
	{ id: 1, name: 'Destard' },
	{ id: 2, name: 'Covetous' },
	{ id: 3, name: 'Shame' },
	{ id: 4, name: 'Wrong' },
	{ id: 5, name: 'Despise' },
	{ id: 6, name: 'Doom' },
	{ id: 7, name: 'Hythloth' },
	{ id: 8, name: 'Hythloth (alias)' },
];

/* ===================================================================
 *  TEMPLATES  (for "New Region")
 * =================================================================== */
const TEMPLATES = [
	{
		label: 'Town (Justice + City pair)',
		prefix: 'TOWN',
		paired: true,
		zMin: -10,
		zMax: 127,
	},
	{ label: 'Justice Zone', prefix: 'JUSTICE_', zMin: -10, zMax: 127 },
	{ label: 'City Zone', prefix: 'CITY_', zMin: -127, zMax: 127 },
	{ label: 'Dungeon', prefix: 'DUNGEON_', zMin: -127, zMax: 127 },
	{ label: 'No Housing', prefix: 'HOUSING_NO_', zMin: -127, zMax: 127 },
	{ label: 'Allow Housing', prefix: 'HOUSING_YES_', zMin: -127, zMax: 127 },
	{ label: 'No Guards', prefix: 'NO_GUARD_', zMin: -127, zMax: 127 },
	{ label: 'No Spells', prefix: 'NOSPELL_', zMin: -127, zMax: 127 },
	{ label: 'No Spawn', prefix: 'NOSPAWN_', zMin: -127, zMax: 127 },
	{ label: 'Inn', prefix: 'INN_', zMin: -127, zMax: 127 },
	{ label: 'Tavern', prefix: 'TAVERN_', zMin: -127, zMax: 127 },
	{ label: 'Safe Location', prefix: 'SAFELO_', zMin: -127, zMax: 127 },
	{ label: 'Custom...', prefix: '', zMin: -127, zMax: 127 },
];

/* ===================================================================
 *  REGION COLORS  (by name prefix)
 * =================================================================== */
const COLOR_MAP = [
	['JUSTICE', { fill: 'rgba(30,120,255,0.25)', stroke: '#1e78ff' }],
	['CITY', { fill: 'rgba(50,200,50,0.25)', stroke: '#32c832' }],
	['DUNGEON', { fill: 'rgba(220,40,40,0.25)', stroke: '#dc2828' }],
	['DUNGN', { fill: 'rgba(200,60,60,0.25)', stroke: '#c83c3c' }],
	['GUARD', { fill: 'rgba(255,200,0,0.25)', stroke: '#ffc800' }],
	['HORSE', { fill: 'rgba(160,100,40,0.25)', stroke: '#a06428' }],
	['SHRINE', { fill: 'rgba(160,40,200,0.25)', stroke: '#a028c8' }],
	['CAVE', { fill: 'rgba(120,120,120,0.30)', stroke: '#969696' }],
	['MINE', { fill: 'rgba(120,90,60,0.25)', stroke: '#785a3c' }],
	['HOUSING_YES', { fill: 'rgba(80,220,80,0.25)', stroke: '#50dc50' }],
	['HOUSING_NO', { fill: 'rgba(255,120,0,0.25)', stroke: '#ff7800' }],
	['NOSPELL', { fill: 'rgba(255,40,150,0.25)', stroke: '#ff2896' }],
	['NO_GUARD', { fill: 'rgba(180,0,0,0.25)', stroke: '#b40000' }],
	['INN', { fill: 'rgba(0,200,200,0.25)', stroke: '#00c8c8' }],
	['TAVERN', { fill: 'rgba(0,180,180,0.25)', stroke: '#00b4b4' }],
	['SAFELO', { fill: 'rgba(0,220,180,0.25)', stroke: '#00dcb4' }],
	['OCEAN', { fill: 'rgba(0,60,180,0.15)', stroke: '#003cb4' }],
	['FOREST', { fill: 'rgba(0,120,0,0.18)', stroke: '#007800' }],
	['PLAINS', { fill: 'rgba(160,180,80,0.18)', stroke: '#a0b450' }],
	['NONE', { fill: 'rgba(120,120,120,0.15)', stroke: '#787878' }],
	['NEWBIE', { fill: 'rgba(100,255,100,0.20)', stroke: '#64ff64' }],
	['CEMETERY', { fill: 'rgba(80,0,80,0.25)', stroke: '#500050' }],
	['SWAMP', { fill: 'rgba(80,100,0,0.20)', stroke: '#506400' }],
	['WANDER', { fill: 'rgba(200,160,60,0.20)', stroke: '#c8a03c' }],
	['ZOMBIE', { fill: 'rgba(100,140,60,0.25)', stroke: '#648c3c' }],
	['WISP', { fill: 'rgba(180,180,255,0.25)', stroke: '#b4b4ff' }],
	['TEMPLE', { fill: 'rgba(200,180,100,0.25)', stroke: '#c8b464' }],
	['THIE', { fill: 'rgba(100,60,120,0.25)', stroke: '#643c78' }],
	['FIGHTER', { fill: 'rgba(200,80,40,0.25)', stroke: '#c85028' }],
	[
		'BRITAINNIA',
		{ fill: 'rgba(200,200,200,0.08)', stroke: 'rgba(200,200,200,0.3)' },
	],
];
const DEFAULT_COLOR = { fill: 'rgba(200,200,200,0.20)', stroke: '#c8c8c8' };

function getRegionColor(name) {
	const upper = name.toUpperCase();
	for (const [prefix, col] of COLOR_MAP) {
		if (upper.startsWith(prefix)) return col;
	}
	return DEFAULT_COLOR;
}

/* ===================================================================
 *  HANDLE CURSORS
 * =================================================================== */
const HANDLE_CURSORS = {
	nw: 'nwse-resize',
	n: 'ns-resize',
	ne: 'nesw-resize',
	e: 'ew-resize',
	se: 'nwse-resize',
	s: 'ns-resize',
	sw: 'nesw-resize',
	w: 'ew-resize',
};

/* ===================================================================
 *  APPLICATION STATE
 * =================================================================== */
const S = {
	regions: [],
	version: 64207,
	filename: '',
	dirty: false,
	dynDirty: false,
	selectedIdx: -1,
	selectionAnchor: -1, // anchor for shift-click range selection
	selection: new Set(), // multi-select indices
	groupMode: 'none', // 'none' | 'name' | 'bbox'
	showLabels: false,
	showHeatmap: false,
	expandedGroups: new Set(),

	// viewport
	viewX: 0,
	viewY: 0,
	zoom: 0.2,

	// interaction
	mode: 'idle', // idle | pan | pan-pending | move | move-pending | resize | draw
	mouseStartScreen: null,
	mouseStartWorld: null,
	dragStartRegion: null,
	resizeHandle: null,
	drawTemplate: null,
	drawStart: null,
	drawEnd: null,

	// map
	mapImage: null,
	mapLoaded: false,
	mapScale: 1, // pixels-per-tile in loaded map image

	// spawn bank (null until loaded)
	spawnBank: null, // Map<id, {limits: Map<prefix,count>, freq, job}>

	// baseline snapshot for diff (set on load)
	baseline: null, // [{...region}, ...]
};

// Reverse index: prefix -> [{id, count, freq, job}, ...]
let prefixIndex = null;
let groupPrefixIndex = null; // memberId -> [{ prefix, count, groupId, groupJob }, ...]

/* ===================================================================
 *  UNDO / REDO
 * =================================================================== */
const UNDO_LIMIT = 100;
const undoStack = []; // past states
const redoStack = []; // future states

function cloneRegions() {
	return S.regions.map((r) => ({ ...r }));
}

function snapshotEntity(e) {
	return {
		x: e.x,
		y: e.y,
		z: e.z,
		typeId: e.typeId,
		cont: e.cont,
		eqpos: e.eqpos,
		resKey: e.resKey,
		fields: [...e.fields],
	};
}

function applyEntitySnapshot(e, snap) {
	e.x = snap.x;
	e.y = snap.y;
	e.z = snap.z;
	e.typeId = snap.typeId;
	e.cont = snap.cont;
	e.eqpos = snap.eqpos;
	e.resKey = snap.resKey;
	e.fields = [...snap.fields];
}

function pushStackEntry(entry) {
	undoStack.push(entry);
	if (undoStack.length > UNDO_LIMIT) undoStack.shift();
	redoStack.length = 0;
	updateUndoButtons();
}

/** Call BEFORE mutating S.regions. */
function pushUndo() {
	pushStackEntry({
		kind: 'regions',
		regions: cloneRegions(),
		selectedIdx: S.selectedIdx,
	});
}

/** Call BEFORE mutating an entity in place (loc, fields). */
function pushDynMutateUndo(entity) {
	pushStackEntry({ kind: 'dyn-mutate', entity, snap: snapshotEntity(entity) });
}

/** Call AFTER appending entity to dynEntities. */
function pushDynAddUndo(entity) {
	pushStackEntry({
		kind: 'dyn-add',
		entity,
		idx: dynEntities.length - 1,
	});
}

/** Call BEFORE splicing entity out of dynEntities. */
function pushDynRemoveUndo(entity, idx) {
	pushStackEntry({ kind: 'dyn-remove', entity, idx });
}

/** Call AFTER removing a set of entities from dynEntities. */
function pushDynBatchRemoveUndo(entities) {
	pushStackEntry({ kind: 'dyn-batch-remove', entities });
}

function undo() {
	if (undoStack.length === 0) return;
	const op = undoStack.pop();
	applyUndoOp(op, redoStack);
}

function redo() {
	if (redoStack.length === 0) return;
	const op = redoStack.pop();
	applyUndoOp(op, undoStack);
}

/**
 * Apply an undo entry, capturing the current state into the opposite stack
 * so the operation is invertible.
 */
function applyUndoOp(op, oppositeStack) {
	if (op.kind === 'regions') {
		oppositeStack.push({
			kind: 'regions',
			regions: cloneRegions(),
			selectedIdx: S.selectedIdx,
		});
		S.regions = op.regions;
		S.selectedIdx = op.selectedIdx;
		if (S.selectedIdx >= S.regions.length) S.selectedIdx = -1;
		afterRegionUndoRedo();
	} else if (op.kind === 'dyn-mutate') {
		const cur = snapshotEntity(op.entity);
		applyEntitySnapshot(op.entity, op.snap);
		oppositeStack.push({ kind: 'dyn-mutate', entity: op.entity, snap: cur });
		afterDynUndoRedo();
	} else if (op.kind === 'dyn-add') {
		// Forward op was: entity appended. Inverse: remove it.
		const i = dynEntities.indexOf(op.entity);
		if (i >= 0) dynEntities.splice(i, 1);
		oppositeStack.push({ kind: 'dyn-remove', entity: op.entity, idx: i });
		afterDynUndoRedo();
	} else if (op.kind === 'dyn-remove') {
		// Forward op was: entity spliced. Inverse: insert back.
		dynEntities.splice(op.idx, 0, op.entity);
		oppositeStack.push({ kind: 'dyn-add', entity: op.entity, idx: op.idx });
		afterDynUndoRedo();
	} else if (op.kind === 'dyn-batch-remove') {
		// Forward op removed a set of entities. Inverse: re-add them all.
		// dynEntities order is non-load-bearing, so plain push is fine.
		for (const e of op.entities) dynEntities.push(e);
		oppositeStack.push({ kind: 'dyn-batch-add', entities: op.entities });
		afterDynUndoRedo();
	} else if (op.kind === 'dyn-batch-add') {
		// Forward op added a set of entities. Inverse: remove them all.
		const set = new Set(op.entities);
		dynEntities = dynEntities.filter((e) => !set.has(e));
		window.dynEntities = dynEntities;
		oppositeStack.push({ kind: 'dyn-batch-remove', entities: op.entities });
		afterDynUndoRedo();
	}
	updateUndoButtons();
}

function afterRegionUndoRedo() {
	S.selection.clear();
	if (S.selectedIdx >= 0) S.selection.add(S.selectedIdx);
	markDirty();
	updateRegionList();
	updatePropsPanel();
	updateUndoButtons();
	requestRender();
	const sel = S.selectedIdx >= 0 ? S.regions[S.selectedIdx] : null;
	document.getElementById('status-selected').textContent = sel
		? `Selected: ${sel.name} (#${sel.id})`
		: '';
	document.getElementById('status-regions').textContent =
		`Regions: ${S.regions.length}`;
	updateSpawnStatus();
}

function rebuildDynIndices() {
	dynById = new Map();
	dynChildren = new Map();
	for (const e of dynEntities) {
		if (e.id >= 0) dynById.set(e.id, e);
	}
	for (const e of dynEntities) {
		if (e.cont !== undefined) {
			if (!dynChildren.has(e.cont)) dynChildren.set(e.cont, []);
			dynChildren.get(e.cont).push(e);
		}
	}
	dynByCategory = buildDynIndex(dynEntities);
}

function afterDynUndoRedo() {
	rebuildDynIndices();
	markDynDirty();
	updateDynStatus();
	if (dynPanelOpen) buildDynPanel(document.getElementById('dyn-search').value);
	if (isEntityDiffOpen()) refreshEntityDiff();
	// Re-render the open properties panel: its fields or its
	// Contents/Equipment lists may have changed under it.
	if (selectedDynEntity) showDynProps(selectedDynEntity);
	requestRender();
}

function updateUndoButtons() {
	document.getElementById('btn-undo').disabled = undoStack.length === 0;
	document.getElementById('btn-redo').disabled = redoStack.length === 0;
}

function resetUndoHistory() {
	undoStack.length = 0;
	redoStack.length = 0;
	updateUndoButtons();
}

/* ===================================================================
 *  DOM REFERENCES
 * =================================================================== */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const $list = document.getElementById('region-list');
const $search = document.getElementById('search-input');
const $propsContent = document.getElementById('props-content');
const $propsEmpty = document.getElementById('props-empty');
const $drawHint = document.getElementById('draw-hint');

/** Reset all visible panels in a sidebar to equal flex distribution */
function resetPanelHeights(sidebar) {
	sidebar.querySelectorAll('.sidebar-panel').forEach((p) => {
		if (!p.hidden) {
			p.style.height = '';
			p.style.flex = '';
		}
	});
}

/* ===================================================================
 *  REGION PARSING / ENCODING
 * =================================================================== */
function parseRegionLine(line) {
	const t = line.trim();
	if (!t || t.startsWith('version')) return null;
	const parts = t.split(/\s+/);
	if (parts.length < 14) {
		console.warn(
			`regions.txt: skipping line with ${parts.length} fields (expected >= 14): ${t.slice(0, 80)}`,
		);
		return null;
	}
	const r = {
		id: parseInt(parts[0]),
		x: parseInt(parts[1]),
		y: parseInt(parts[2]),
		w: parseInt(parts[3]),
		h: parseInt(parts[4]),
		zMin: parseInt(parts[5]),
		zMax: parseInt(parts[6]),
		flags: parseInt(parts[7]),
		name: parts[8],
		f1: parseInt(parts[9]),
		f2: parseInt(parts[10]),
		f3: parseInt(parts[11]),
		type: parseInt(parts[12]),
		f4: parseInt(parts[13]),
		desc: '',
	};
	if (isNaN(r.id) || isNaN(r.x)) {
		console.warn(
			`regions.txt: skipping line with non-numeric id or x: ${t.slice(0, 80)}`,
		);
		return null;
	}
	// extract description: everything after 14th whitespace-delimited field
	let p = 0;
	for (let i = 0; i < 14; i++) {
		while (p < t.length && /\s/.test(t[p])) p++;
		while (p < t.length && !/\s/.test(t[p])) p++;
	}
	while (p < t.length && /\s/.test(t[p])) p++;
	if (p < t.length) r.desc = t.substring(p);
	return r;
}

function parseRegions(text) {
	const lines = text.split('\n');
	let version = 64207;
	const regions = [];
	for (const line of lines) {
		const t = line.trim();
		if (t.startsWith('version')) {
			const m = t.match(/version\s+(\d+)/);
			if (m) version = parseInt(m[1]);
			continue;
		}
		const r = parseRegionLine(line);
		if (r) regions.push(r);
	}
	return { version, regions };
}

function formatRegion(r) {
	let s = [
		String(r.id).padStart(5),
		String(r.x).padStart(5),
		String(r.y).padStart(5),
		String(r.w).padStart(5),
		String(r.h).padStart(5),
		String(r.zMin).padStart(5),
		String(r.zMax).padStart(5),
		String(r.flags).padStart(12),
		r.name,
		r.f1,
		r.f2,
		r.f3,
		r.type,
		r.f4,
	].join(' ');
	if (r.desc) s += ' ' + r.desc;
	return s;
}

function encodeRegions() {
	// sort by ID to match original file convention
	const sorted = [...S.regions].sort((a, b) => a.id - b.id);
	let text = 'version ' + S.version + '\n';
	for (const r of sorted) text += formatRegion(r) + '\n';
	return text;
}

/* ===================================================================
 *  SPAWN BANK PARSING (templatestable.dat)
 * =================================================================== */
function parseTemplateTable(text) {
	const bank = new Map();
	const lines = text.replace(/\r/g, '').split('\n');
	let cur = null;

	function freshTemplate() {
		return {
			comment: '',
			job: '',
			freq: 0,
			bodyType: '',
			typeName: '',
			limits: new Map(),
			regions: [],
			createsNpcs: false,
			members: [],
			sex: '',
			name: '',
			equipment: [],
			skills: [],
			resources: [],
			stats: {},
			scripts: [],
			alignment: '',
			notoriety: '',
		};
	}

	function flush(id) {
		if (id < 0 || !cur) return;
		cur.job = cur.job || cur.comment || '?';
		bank.set(id, cur);
	}

	let id = -1;
	cur = freshTemplate();

	for (const raw of lines) {
		const line = raw.trim();
		const idMatch = line.match(/^<(\d+)>$/);
		if (idMatch) {
			flush(id);
			id = parseInt(idMatch[1]);
			cur = freshTemplate();
			continue;
		}
		if (line.includes('@@@ END @@@')) {
			flush(id);
			id = -1;
			cur = freshTemplate();
			continue;
		}
		if (id < 0) continue;
		if (line.startsWith('#')) {
			cur.comment = line.substring(1).trim();
			continue;
		}
		const fm = line.match(/^<(\w+)\s+(.*?)>$/);
		if (!fm) continue;
		const key = fm[1].toLowerCase(),
			val = fm[2].trim();
		switch (key) {
			case 'job':
				cur.job = val;
				break;
			case 'frequency':
				cur.freq = parseInt(val) || 0;
				break;
			case 'type': {
				const parts = val.split(/\s+/);
				cur.typeName = parts[0];
				if (parts.length >= 2 && parts[0].toUpperCase() !== 'ITEM')
					cur.bodyType = parts.slice(1).join(' ');
				break;
			}
			case 'regionlimit': {
				const bm = val.match(/\{(.+?)\}/);
				if (bm) {
					const tokens = bm[1].trim().split(/\s+/);
					for (let i = 0; i + 1 < tokens.length; i += 2)
						cur.limits.set(tokens[i], parseInt(tokens[i + 1]) || 0);
				}
				break;
			}
			case 'region': {
				const bm = val.match(/\{(.+?)\}/);
				if (bm) {
					const tokens = bm[1].trim().split(/\s+/);
					for (let i = 0; i < tokens.length; i += 2)
						cur.regions.push(tokens[i]);
				} else {
					cur.regions.push(val);
				}
				break;
			}
			case 'createsnpcs':
				cur.createsNpcs = parseInt(val) === 1;
				break;
			case 'sex':
				cur.sex = val;
				break;
			case 'name':
				cur.name = val;
				break;
			case 'eq': {
				cur.equipment.push(val);
				const tok = val.split(/\s+/)[0];
				const n = parseInt(tok, 10);
				if (cur.createsNpcs && Number.isFinite(n) && n >= 100000)
					cur.members.push(n - 100000);
				break;
			}
			case 'sk':
				cur.skills.push(val);
				break;
			case 'resource':
				cur.resources.push(val);
				break;
			case 'script':
				cur.scripts.push(val);
				break;
			case 'alignment':
				cur.alignment = val;
				break;
			case 'notoriety':
				cur.notoriety = val;
				break;
			case 'strength':
			case 'dexterity':
			case 'intelligence':
			case 'hp':
			case 'mana':
			case 'stamina':
				cur.stats[key] = val;
				break;
		}
	}
	flush(id);
	S.spawnBank = bank;
	buildPrefixIndex();
}

function buildPrefixIndex() {
	prefixIndex = new Map();
	groupPrefixIndex = new Map();
	if (!S.spawnBank) return;
	for (const [id, tmpl] of S.spawnBank) {
		for (const [prefix, count] of tmpl.limits) {
			if (!prefixIndex.has(prefix)) prefixIndex.set(prefix, []);
			prefixIndex.get(prefix).push({
				id,
				count,
				freq: tmpl.freq,
				job: tmpl.job,
				bodyType: tmpl.bodyType,
				typeName: tmpl.typeName,
				createsNpcs: tmpl.createsNpcs,
				memberCount: tmpl.members.length,
			});
		}
		if (tmpl.createsNpcs && tmpl.members.length > 0) {
			const groupJob = tmpl.job || tmpl.comment || `#${id}`;
			for (const [prefix, count] of tmpl.limits) {
				for (const memberId of tmpl.members) {
					if (!groupPrefixIndex.has(memberId))
						groupPrefixIndex.set(memberId, []);
					groupPrefixIndex.get(memberId).push({
						prefix,
						count,
						groupId: id,
						groupJob,
					});
				}
			}
		}
	}
	// sort each prefix's entries by count descending
	for (const arr of prefixIndex.values()) {
		arr.sort((a, b) => b.count - a.count);
	}
}

function getSpawnsForRegion(regionName) {
	if (!prefixIndex) return [];
	const upper = regionName.toUpperCase();
	const results = [];
	const seen = new Set();
	for (const [prefix, entries] of prefixIndex) {
		if (upper.startsWith(prefix) || upper === prefix) {
			for (const e of entries) {
				if (!seen.has(e.id)) {
					seen.add(e.id);
					results.push({ ...e, prefix });
				}
			}
		}
	}
	results.sort((a, b) => b.count - a.count);
	return results;
}

function spawnCategory(s) {
	const t = s.typeName ? s.typeName.toUpperCase() : '';
	if (t === 'ITEM') return 'item';
	if (t === 'NONE') return 'other';
	if (t === 'SHOPKEEPER') return 'shopkeeper';
	if (t === 'GUARD') return 'guard';
	return 'npc';
}

function spawnTotals(spawns, area, regionName) {
	let npcs = 0,
		shopkeepers = 0,
		guards = 0,
		items = 0,
		other = 0;
	for (const s of spawns) {
		const c = spawnCount(area, s.count, regionName);
		// group spawns (createsnpcs, e.g. Undead Group) place several
		// NPC members each - count the members, not the single group
		if (s.createsNpcs && s.memberCount > 0) {
			npcs += c * s.memberCount;
			continue;
		}
		switch (spawnCategory(s)) {
			case 'npc':
				npcs += c;
				break;
			case 'shopkeeper':
				shopkeepers += c;
				break;
			case 'guard':
				guards += c;
				break;
			case 'item':
				items += c;
				break;
			case 'other':
				other += c;
				break;
		}
	}
	return {
		npcs,
		shopkeepers,
		guards,
		items,
		other,
		total: npcs + shopkeepers + guards + items + other,
	};
}

/** NPC spawn density for a region: the `npcs` spawn-category count
 *  over the region's tile area, expressed per 1,000 tiles. Used by the
 *  panel stat and the heatmap. */
function regionNpcDensity(r) {
	const area = r.w * r.h;
	const count = spawnTotals(getSpawnsForRegion(r.name), area, r.name).npcs;
	return { count, perK: area > 0 ? (count / area) * 1000 : 0 };
}

/** One-line NPC-density summary for the region panel. */
function formatNpcDensity(d) {
	return `Density: ${d.perK.toFixed(2)} per 1,000 tiles`;
}

function formatSpawnTotals(t, templateCount) {
	const parts = [];
	if (t.npcs > 0) parts.push(`${t.npcs} NPCs`);
	if (t.shopkeepers > 0) parts.push(`${t.shopkeepers} shopkeepers`);
	if (t.guards > 0) parts.push(`${t.guards} guards`);
	if (t.items > 0) parts.push(`${t.items} items`);
	if (t.other > 0) parts.push(`${t.other} other`);
	if (parts.length === 0) parts.push('0 NPCs');
	return `${parts.join(', ')} (${templateCount} templates)`;
}

function compactSpawnBadge(t) {
	const parts = [];
	if (t.npcs > 0) parts.push(`${t.npcs}n`);
	if (t.shopkeepers > 0) parts.push(`${t.shopkeepers}s`);
	if (t.guards > 0) parts.push(`${t.guards}g`);
	if (t.items > 0) parts.push(`${t.items}i`);
	if (t.other > 0) parts.push(`${t.other}o`);
	return parts.length > 0 ? parts.join('+') : '0';
}

/** Matches CResBankRegion_SpawnInSubRegion (resbank.c, 0x004AFC4B):
 *  count = regionlimit (scalingWts) by default; overridden to
 *  area/2560 when the sub-region's name contains the "SCALING"
 *  substring (the level-editor's opt-in marker for area-scaled
 *  density); floored at 1 to close the binary's count==0 fall-
 *  through where small SCALING boxes would otherwise spawn
 *  unboundedly. regionName is required. */
function spawnCount(area, regionLimit, regionName) {
	let count = regionLimit > 0 ? regionLimit : 0;
	if (regionName.indexOf('SCALING') !== -1) {
		count = Math.floor(area / 2560);
	}
	if (count < 1) count = 1;
	return count;
}

/** True when the server would pass noWander=1 to SpawnInSubRegion.
 *  Requires SHOPKEEPER type (tmpl->type==4) in a city resbank region
 *  (noWander==1, set by prefix "city", resbank.c:5156). */
function isNoWander(s) {
	return (
		s.typeName &&
		s.typeName.toUpperCase() === 'SHOPKEEPER' &&
		s.prefix &&
		s.prefix.toUpperCase().startsWith('CITY')
	);
}

/** Update status bar with world spawn totals from regions + bank. */
function updateSpawnStatus() {
	const $el = document.getElementById('status-spawn');
	if (!S.spawnBank || S.regions.length === 0) {
		$el.textContent = '';
		return;
	}
	let npcs = 0,
		shopkeepers = 0,
		guards = 0,
		items = 0,
		other = 0;
	for (const r of S.regions) {
		const spawns = getSpawnsForRegion(r.name);
		const area = r.w * r.h;
		const t = spawnTotals(spawns, area, r.name);
		npcs += t.npcs;
		shopkeepers += t.shopkeepers;
		guards += t.guards;
		items += t.items;
		other += t.other;
	}
	const parts = [];
	if (npcs > 0) parts.push(`NPCs: ${npcs}`);
	if (shopkeepers > 0) parts.push(`Shopkeepers: ${shopkeepers}`);
	if (guards > 0) parts.push(`Guards: ${guards}`);
	if (items > 0) parts.push(`Items: ${items}`);
	if (other > 0) parts.push(`Other: ${other}`);
	$el.textContent = parts.length ? 'Spawns: ' + parts.join(' | ') : '';
}

/* ===================================================================
 *  COORDINATE TRANSFORMS
 * =================================================================== */
function screenToWorld(sx, sy) {
	return { x: sx / S.zoom + S.viewX, y: sy / S.zoom + S.viewY };
}
function worldToScreen(wx, wy) {
	return { x: (wx - S.viewX) * S.zoom, y: (wy - S.viewY) * S.zoom };
}

/* ===================================================================
 *  BBOX GROUPING HELPERS
 * =================================================================== */
function bboxKey(r) {
	return `${r.x},${r.y},${r.w},${r.h}`;
}

/** Build Map<bboxKey, index[]> from current regions. */
function buildBboxMap() {
	const m = new Map();
	for (let i = 0; i < S.regions.length; i++) {
		const k = bboxKey(S.regions[i]);
		if (!m.has(k)) m.set(k, []);
		m.get(k).push(i);
	}
	return m;
}

/** Return all region indices sharing the same bbox as the given index. */
function bboxPeers(idx) {
	if (idx < 0) return [];
	const k = bboxKey(S.regions[idx]);
	const peers = [];
	for (let i = 0; i < S.regions.length; i++) {
		if (bboxKey(S.regions[i]) === k) peers.push(i);
	}
	return peers;
}

/* ===================================================================
 *  RENDER
 * =================================================================== */
let renderPending = false;
function requestRender() {
	if (!renderPending) {
		renderPending = true;
		requestAnimationFrame(doRender);
	}
}

function doRender() {
	renderPending = false;
	const wrap = canvas.parentElement;
	const dpr = window.devicePixelRatio || 1;
	const cw = wrap.clientWidth,
		ch = wrap.clientHeight;
	if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
		canvas.width = cw * dpr;
		canvas.height = ch * dpr;
	}

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.fillStyle = '#111118';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const z = S.zoom * dpr;
	ctx.setTransform(z, 0, 0, z, -S.viewX * z, -S.viewY * z);

	// map image
	if (S.mapLoaded) {
		ctx.imageSmoothingEnabled =
			S.zoom * (window.devicePixelRatio || 1) < S.mapScale;
		ctx.drawImage(S.mapImage, 0, 0, MAP_W, MAP_H);
	}

	// tile grid at high zoom
	if (S.zoom >= 4) drawGrid(dpr);

	// regions
	drawRegions(dpr);

	// dynamic entities overlay
	drawDynEntities(dpr);

	// selection handles
	if (S.selectedIdx >= 0) drawSelection(dpr);

	// draw-mode rectangle
	if (S.mode === 'draw' && S.drawStart && S.drawEnd) drawNewRect(dpr);

	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawGrid(dpr) {
	const z = S.zoom * dpr;
	const cw = canvas.width / z,
		ch = canvas.height / z;
	const x0 = Math.max(0, Math.floor(S.viewX));
	const y0 = Math.max(0, Math.floor(S.viewY));
	const x1 = Math.min(MAP_W, Math.ceil(S.viewX + cw));
	const y1 = Math.min(MAP_H, Math.ceil(S.viewY + ch));
	ctx.strokeStyle = 'rgba(255,255,255,0.08)';
	ctx.lineWidth = 1 / S.zoom;
	ctx.beginPath();
	for (let x = x0; x <= x1; x++) {
		ctx.moveTo(x, y0);
		ctx.lineTo(x, y1);
	}
	for (let y = y0; y <= y1; y++) {
		ctx.moveTo(x0, y);
		ctx.lineTo(x1, y);
	}
	ctx.stroke();
}

function isVisible(r) {
	const cw = canvas.width / (S.zoom * (window.devicePixelRatio || 1));
	const ch = canvas.height / (S.zoom * (window.devicePixelRatio || 1));
	return (
		r.x + r.w > S.viewX &&
		r.x < S.viewX + cw &&
		r.y + r.h > S.viewY &&
		r.y < S.viewY + ch
	);
}

function drawRegions(dpr) {
	if (S.showHeatmap && S.spawnBank) {
		drawHeatmap(dpr);
		return;
	}
	if (S.groupMode === 'bbox') {
		drawRegionsBbox(dpr);
	} else {
		drawRegionsNormal(dpr);
	}
}

function drawHeatmap(dpr) {
	// log-normalize: the density distribution is heavily right-skewed
	// (tiny capped regions dwarf the rest), so a linear scale goes all-green
	let maxPerK = 0;
	for (const r of S.regions) {
		const p = regionNpcDensity(r).perK;
		if (p > maxPerK) maxPerK = p;
	}

	const lw = Math.max(1, 1.2) / S.zoom;
	const labelZoom = S.zoom >= 0.15;
	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (!isVisible(r)) continue;
		const nd = regionNpcDensity(r);
		const intensity =
			maxPerK > 0 ? Math.log1p(nd.perK) / Math.log1p(maxPerK) : 0;
		const isSel = i === S.selectedIdx || S.selection.has(i);

		// color: green (low) -> yellow -> red (high), transparent if no NPCs
		if (nd.count === 0) {
			ctx.fillStyle = 'rgba(60,60,60,0.15)';
		} else {
			const r255 = Math.min(255, Math.floor(intensity * 2 * 255));
			const g255 = Math.min(255, Math.floor((1 - intensity) * 2 * 255));
			ctx.fillStyle = `rgba(${r255},${g255},40,0.35)`;
		}
		ctx.fillRect(r.x, r.y, r.w, r.h);

		ctx.strokeStyle = isSel
			? '#fff'
			: nd.count > 0
				? `rgb(${Math.min(255, Math.floor(intensity * 2 * 255))},${Math.min(255, Math.floor((1 - intensity) * 2 * 255))},40)`
				: '#555';
		ctx.lineWidth = isSel ? 2.5 / S.zoom : lw;
		if (isSel) ctx.setLineDash([6 / S.zoom, 4 / S.zoom]);
		ctx.strokeRect(r.x, r.y, r.w, r.h);
		if (isSel) ctx.setLineDash([]);

		// label with NPC density (per 1,000 tiles)
		if (S.showLabels && labelZoom && r.w * S.zoom > 40 && r.h * S.zoom > 14) {
			const fs = Math.min(14, Math.max(9, r.h * 0.35)) / S.zoom;
			ctx.font = `bold ${fs}px monospace`;
			ctx.fillStyle = '#fff';
			ctx.globalAlpha = 0.9;
			ctx.fillText(
				`${r.name} [${nd.perK.toFixed(2)}/k]`,
				r.x + 2 / S.zoom,
				r.y + fs + 1 / S.zoom,
			);
			ctx.globalAlpha = 1.0;
		}
	}
}

function countVisibleRegions() {
	let n = 0;
	for (const r of S.regions) {
		if (isVisible(r)) n++;
	}
	return n;
}

function scaleAlpha(rgbaStr, factor) {
	const m = rgbaStr.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
	if (!m) return rgbaStr;
	const a = Math.max(0.02, Math.min(1, parseFloat(m[4]) * factor));
	return `rgba(${m[1]},${m[2]},${m[3]},${a.toFixed(3)})`;
}

function drawRegionsNormal(dpr) {
	const lw = Math.max(1, 1.2) / S.zoom;
	const labelZoom = S.zoom >= 0.15;
	// gather grouped highlight indices
	const highlightSet = new Set();
	if (S.groupMode === 'name' && S.selectedIdx >= 0) {
		const selName = S.regions[S.selectedIdx].name;
		for (let i = 0; i < S.regions.length; i++) {
			if (S.regions[i].name === selName) highlightSet.add(i);
		}
	}

	// auto-scale fill opacity: full at <=15 visible, down to 15% at 200+
	const nVis = countVisibleRegions();
	const opacityScale = nVis <= 15 ? 1.0 : Math.max(0.15, 15 / nVis);

	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (!isVisible(r)) continue;
		const col = getRegionColor(r.name);
		const isSel = i === S.selectedIdx;
		const isMultiSel = S.selection.has(i) && !isSel;
		const isGrouped = highlightSet.has(i) && !isSel && !isMultiSel;

		ctx.fillStyle =
			isSel || isMultiSel ? col.fill : scaleAlpha(col.fill, opacityScale);
		ctx.fillRect(r.x, r.y, r.w, r.h);

		ctx.strokeStyle = isSel
			? '#fff'
			: isMultiSel
				? '#ffcc00'
				: isGrouped
					? '#aaccff'
					: col.stroke;
		ctx.lineWidth = isSel
			? 2.5 / S.zoom
			: isMultiSel || isGrouped
				? 1.8 / S.zoom
				: lw;
		if (isSel || isMultiSel) {
			ctx.setLineDash([6 / S.zoom, 4 / S.zoom]);
		}
		ctx.strokeRect(r.x, r.y, r.w, r.h);
		if (isSel || isMultiSel) ctx.setLineDash([]);

		// label
		if (S.showLabels && labelZoom && r.w * S.zoom > 30 && r.h * S.zoom > 14) {
			const fs = Math.min(14, Math.max(9, r.h * 0.35)) / S.zoom;
			ctx.font = `bold ${fs}px monospace`;
			ctx.fillStyle = isSel || isMultiSel ? '#fff' : col.stroke;
			ctx.globalAlpha = isSel || isMultiSel ? 1.0 : 0.85;
			ctx.fillText(r.name, r.x + 2 / S.zoom, r.y + fs + 1 / S.zoom);
			if (r.desc && r.h * S.zoom > 28) {
				ctx.font = `${fs * 0.8}px monospace`;
				ctx.fillStyle = '#ccc';
				ctx.fillText(r.desc, r.x + 2 / S.zoom, r.y + fs * 1.9 + 1 / S.zoom);
			}
			ctx.globalAlpha = 1.0;
		}

		// density badge (bottom-left): spawn capacity by category
		if (S.spawnBank && S.showLabels && labelZoom && r.w * S.zoom > 50) {
			const spawns = getSpawnsForRegion(r.name);
			if (spawns.length > 0) {
				const area = r.w * r.h;
				const t = spawnTotals(spawns, area, r.name);
				drawDensityBadge(r.x, r.y + r.h, t);
			}
		}
	}

	// diff highlight overlay
	if (diffHighlightIdx >= 0 && diffHighlightIdx < S.regions.length) {
		const r = S.regions[diffHighlightIdx];
		ctx.strokeStyle = '#ffff00';
		ctx.lineWidth = 3.5 / S.zoom;
		ctx.setLineDash([8 / S.zoom, 4 / S.zoom]);
		ctx.strokeRect(r.x, r.y, r.w, r.h);
		ctx.setLineDash([]);
		ctx.fillStyle = 'rgba(255,255,0,0.15)';
		ctx.fillRect(r.x, r.y, r.w, r.h);
	}
}

function drawRegionsBbox(dpr) {
	const lw = Math.max(1, 1.2) / S.zoom;
	const labelZoom = S.zoom >= 0.15;
	const bmap = buildBboxMap();
	const selKey = S.selectedIdx >= 0 ? bboxKey(S.regions[S.selectedIdx]) : null;

	const nVis = countVisibleRegions();
	const opacityScale = nVis <= 15 ? 1.0 : Math.max(0.15, 15 / nVis);

	for (const [key, indices] of bmap) {
		const r = S.regions[indices[0]]; // representative region
		if (!isVisible(r)) continue;
		const col = getRegionColor(r.name);
		const isSel = key === selKey;
		const count = indices.length;

		ctx.fillStyle = isSel ? col.fill : scaleAlpha(col.fill, opacityScale);
		ctx.fillRect(r.x, r.y, r.w, r.h);

		ctx.strokeStyle = isSel ? '#fff' : col.stroke;
		ctx.lineWidth = isSel ? 2.5 / S.zoom : lw;
		if (isSel) ctx.setLineDash([6 / S.zoom, 4 / S.zoom]);
		ctx.strokeRect(r.x, r.y, r.w, r.h);
		if (isSel) ctx.setLineDash([]);

		// label
		if (S.showLabels && labelZoom && r.w * S.zoom > 30 && r.h * S.zoom > 14) {
			const fs = Math.min(14, Math.max(9, r.h * 0.35)) / S.zoom;
			ctx.font = `bold ${fs}px monospace`;
			ctx.fillStyle = isSel ? '#fff' : col.stroke;
			ctx.globalAlpha = isSel ? 1.0 : 0.85;
			// show all names in the stack
			const names = indices.map((i) => S.regions[i].name);
			const label =
				names.length <= 3
					? names.join(', ')
					: names.slice(0, 2).join(', ') + ', ...';
			ctx.fillText(label, r.x + 2 / S.zoom, r.y + fs + 1 / S.zoom);
			ctx.globalAlpha = 1.0;
		}

		// count badge (top-right corner)
		if (count > 1) {
			drawBadge(r.x + r.w, r.y, count);
		}

		// density badge (bottom-left): spawn capacity by category
		if (S.spawnBank && S.showLabels && labelZoom && r.w * S.zoom > 50) {
			const spawns = getSpawnsForRegion(r.name);
			if (spawns.length > 0) {
				const area = r.w * r.h;
				const t = spawnTotals(spawns, area, r.name);
				drawDensityBadge(r.x, r.y + r.h, t);
			}
		}
	}

	// diff highlight overlay
	if (diffHighlightIdx >= 0 && diffHighlightIdx < S.regions.length) {
		const r = S.regions[diffHighlightIdx];
		ctx.strokeStyle = '#ffff00';
		ctx.lineWidth = 3.5 / S.zoom;
		ctx.setLineDash([8 / S.zoom, 4 / S.zoom]);
		ctx.strokeRect(r.x, r.y, r.w, r.h);
		ctx.setLineDash([]);
		ctx.fillStyle = 'rgba(255,255,0,0.15)';
		ctx.fillRect(r.x, r.y, r.w, r.h);
	}
}

function drawBadge(wx, wy, count) {
	const text = String(count);
	const fs = 10 / S.zoom;
	ctx.font = `bold ${fs}px sans-serif`;
	const tw = ctx.measureText(text).width;
	const pad = 3 / S.zoom;
	const bw = tw + pad * 2;
	const bh = fs + pad * 1.4;
	const bx = wx - bw - 1 / S.zoom;
	const by = wy + 1 / S.zoom;

	ctx.fillStyle = '#007acc';
	ctx.beginPath();
	const rad = 3 / S.zoom;
	if (ctx.roundRect) {
		ctx.roundRect(bx, by, bw, bh, rad);
	} else {
		ctx.rect(bx, by, bw, bh);
	}
	ctx.fill();

	ctx.fillStyle = '#fff';
	ctx.fillText(text, bx + pad, by + fs + pad * 0.2);
}

function drawDensityBadge(wx, wy, t) {
	const text = compactSpawnBadge(t);
	const fs = 9 / S.zoom;
	ctx.font = `${fs}px sans-serif`;
	const tw = ctx.measureText(text).width;
	const pad = 2 / S.zoom;
	const bw = tw + pad * 2;
	const bh = fs + pad * 1.4;
	const bx = wx + 1 / S.zoom;
	const by = wy - bh - 1 / S.zoom;

	ctx.fillStyle = 'rgba(0,80,60,0.8)';
	ctx.beginPath();
	const rad = 2 / S.zoom;
	if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, rad);
	else ctx.rect(bx, by, bw, bh);
	ctx.fill();

	ctx.fillStyle = '#4ec9b0';
	ctx.fillText(text, bx + pad, by + fs + pad * 0.2);
}

function drawSelection(dpr) {
	const r = S.regions[S.selectedIdx];
	const hs = HANDLE_SIZE / S.zoom;
	const handles = getHandlePositions(r);
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#007acc';
	ctx.lineWidth = 1 / S.zoom;
	for (const h of handles) {
		ctx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
		ctx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
	}
}

function drawNewRect(dpr) {
	const x = Math.min(S.drawStart.x, S.drawEnd.x);
	const y = Math.min(S.drawStart.y, S.drawEnd.y);
	const w = Math.abs(S.drawEnd.x - S.drawStart.x);
	const h = Math.abs(S.drawEnd.y - S.drawStart.y);
	ctx.fillStyle = 'rgba(0,122,204,0.25)';
	ctx.fillRect(x, y, w, h);
	ctx.strokeStyle = '#007acc';
	ctx.lineWidth = 2 / S.zoom;
	ctx.setLineDash([6 / S.zoom, 4 / S.zoom]);
	ctx.strokeRect(x, y, w, h);
	ctx.setLineDash([]);
	// dimension label + per-template spawn capacity (area / 2560).
	// Matches spawnCount() / CResBankRegion_SpawnInSubRegion (0x004AFC4B).
	const fs = 12 / S.zoom;
	ctx.font = `${fs}px monospace`;
	ctx.fillStyle = '#fff';
	const area = Math.round(w) * Math.round(h);
	// Force the area-cap branch with a synthetic SCALING name so the
	// label always reads area/2560, independent of any regionlimit.
	const cap = spawnCount(area, 0, 'SCALING');
	ctx.fillText(
		`${Math.round(w)} \u00d7 ${Math.round(h)}  \u2014  ${cap}/tmpl`,
		x + 3 / S.zoom,
		y - 3 / S.zoom,
	);
}

/* ===================================================================
 *  HIT TESTING
 * =================================================================== */
function getHandlePositions(r) {
	return [
		{ name: 'nw', x: r.x, y: r.y },
		{ name: 'n', x: r.x + r.w / 2, y: r.y },
		{ name: 'ne', x: r.x + r.w, y: r.y },
		{ name: 'e', x: r.x + r.w, y: r.y + r.h / 2 },
		{ name: 'se', x: r.x + r.w, y: r.y + r.h },
		{ name: 's', x: r.x + r.w / 2, y: r.y + r.h },
		{ name: 'sw', x: r.x, y: r.y + r.h },
		{ name: 'w', x: r.x, y: r.y + r.h / 2 },
	];
}

function hitTestHandle(sx, sy) {
	if (S.selectedIdx < 0) return null;
	const r = S.regions[S.selectedIdx];
	const hs = HANDLE_SIZE / 2;
	for (const h of getHandlePositions(r)) {
		const s = worldToScreen(h.x, h.y);
		if (Math.abs(sx - s.x) <= hs && Math.abs(sy - s.y) <= hs) return h.name;
	}
	return null;
}

function hitTestRegion(wx, wy) {
	let bestIdx = -1,
		bestArea = Infinity;
	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (wx >= r.x && wx < r.x + r.w && wy >= r.y && wy < r.y + r.h) {
			const area = r.w * r.h;
			if (area < bestArea) {
				bestArea = area;
				bestIdx = i;
			}
		}
	}
	return bestIdx;
}

/** Return all region indices containing (wx,wy), sorted by area ascending. */
function hitTestAllRegions(wx, wy) {
	const hits = [];
	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (wx >= r.x && wx < r.x + r.w && wy >= r.y && wy < r.y + r.h)
			hits.push(i);
	}
	hits.sort((a, b) => {
		const ra = S.regions[a],
			rb = S.regions[b];
		return ra.w * ra.h - rb.w * rb.h;
	});
	return hits;
}

/* ===================================================================
 *  MOUSE INTERACTION
 * =================================================================== */
function canvasOffset(e) {
	const rect = canvas.getBoundingClientRect();
	return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => {
	if (e.button !== 0) return;
	const { x: sx, y: sy } = canvasOffset(e);
	const world = screenToWorld(sx, sy);
	S.mouseStartScreen = { x: sx, y: sy };
	S.mouseStartWorld = world;

	// draw mode
	if (S.drawTemplate) {
		S.mode = 'draw';
		S.drawStart = { x: Math.round(world.x), y: Math.round(world.y) };
		S.drawEnd = { ...S.drawStart };
		requestRender();
		return;
	}

	// resize handle
	const handle = hitTestHandle(sx, sy);
	if (handle) {
		pushUndo();
		S.mode = 'resize';
		S.resizeHandle = handle;
		S.dragStartRegion = { ...S.regions[S.selectedIdx] };
		return;
	}

	// dynamic entity (check first so dots are clickable through regions)
	const dynEnt = hitTestDynEntity(world.x, world.y);
	if (dynEnt) {
		selectRegion(-1);
		showDynProps(dynEnt);
		S.mode = 'dyn-move-pending';
		S._dynDragEntity = dynEnt;
		S._dynDragStartX = dynEnt.x;
		S._dynDragStartY = dynEnt.y;
		return;
	}

	// region body
	const idx = hitTestRegion(world.x, world.y);
	if (idx >= 0) {
		showDynProps(null);
		selectRegion(idx, e.ctrlKey || e.metaKey, e.shiftKey);
		S.mode = 'move-pending';
		S.dragStartRegion = { ...S.regions[idx] };
		return;
	}

	// empty space -> pan
	S.mode = 'pan-pending';
	showDynProps(null);
	selectRegion(-1);
});

canvas.addEventListener('mousemove', (e) => {
	const { x: sx, y: sy } = canvasOffset(e);
	const world = screenToWorld(sx, sy);

	// status bar
	const tx = Math.floor(world.x),
		ty = Math.floor(world.y);
	let coords = `Tile: ${tx}, ${ty}`;
	if (heightmap && tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H) {
		const b = heightmap[ty * MAP_W + tx];
		coords += `, z: ${b > 127 ? b - 256 : b}`;
	}
	document.getElementById('status-coords').textContent = coords;

	if (S.mode === 'draw') {
		S.drawEnd = { x: Math.round(world.x), y: Math.round(world.y) };
		requestRender();
		return;
	}

	if (S.mode === 'pan-pending' || S.mode === 'pan') {
		const dx = sx - S.mouseStartScreen.x;
		const dy = sy - S.mouseStartScreen.y;
		if (
			S.mode === 'pan-pending' &&
			(Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
		) {
			S.mode = 'pan';
		}
		if (S.mode === 'pan') {
			S.viewX -= (sx - (S._lastPanX || S.mouseStartScreen.x)) / S.zoom;
			S.viewY -= (sy - (S._lastPanY || S.mouseStartScreen.y)) / S.zoom;
			S._lastPanX = sx;
			S._lastPanY = sy;
			requestRender();
		}
		canvas.style.cursor = S.mode === 'pan' ? 'grabbing' : 'grab';
		return;
	}

	if (S.mode === 'dyn-move-pending' || S.mode === 'dyn-move') {
		const dx = sx - S.mouseStartScreen.x;
		const dy = sy - S.mouseStartScreen.y;
		if (
			S.mode === 'dyn-move-pending' &&
			(Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
		) {
			if (S._dynDragEntity) pushDynMutateUndo(S._dynDragEntity);
			S.mode = 'dyn-move';
		}
		if (S.mode === 'dyn-move' && S._dynDragEntity) {
			const ent = S._dynDragEntity;
			ent.x = S._dynDragStartX + Math.round(world.x - S.mouseStartWorld.x);
			ent.y = S._dynDragStartY + Math.round(world.y - S.mouseStartWorld.y);
			requestRender();
		}
		canvas.style.cursor = S.mode === 'dyn-move' ? 'move' : 'pointer';
		return;
	}

	if (S.mode === 'move-pending' || S.mode === 'move') {
		const dx = sx - S.mouseStartScreen.x;
		const dy = sy - S.mouseStartScreen.y;
		if (
			S.mode === 'move-pending' &&
			(Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
		) {
			pushUndo();
			S.mode = 'move';
			// snapshot all selected regions
			S._dragStarts = new Map();
			for (const i of S.selection)
				S._dragStarts.set(i, { x: S.regions[i].x, y: S.regions[i].y });
		}
		if (S.mode === 'move' && S._dragStarts) {
			const wdx = Math.round(world.x - S.mouseStartWorld.x);
			const wdy = Math.round(world.y - S.mouseStartWorld.y);
			for (const [i, start] of S._dragStarts) {
				S.regions[i].x = start.x + wdx;
				S.regions[i].y = start.y + wdy;
			}
			markDirty();
			updatePropsFromRegion();
			requestRender();
		}
		canvas.style.cursor = S.mode === 'move' ? 'move' : 'pointer';
		return;
	}

	if (S.mode === 'resize' && S.selectedIdx >= 0) {
		applyResize(world);
		markDirty();
		updatePropsFromRegion();
		requestRender();
		canvas.style.cursor = HANDLE_CURSORS[S.resizeHandle] || 'default';
		return;
	}

	// idle: update cursor
	if (S.drawTemplate) {
		canvas.style.cursor = 'crosshair';
		return;
	}
	const handle = hitTestHandle(sx, sy);
	if (handle) {
		canvas.style.cursor = HANDLE_CURSORS[handle];
		return;
	}
	const dynHit = hitTestDynEntity(world.x, world.y);
	if (dynHit) {
		canvas.style.cursor = 'pointer';
		return;
	}
	const idx = hitTestRegion(world.x, world.y);
	canvas.style.cursor = idx >= 0 ? 'pointer' : 'grab';
});

canvas.addEventListener('mouseup', (e) => {
	if (e.button === 1 && S.mode === 'pan') {
		S.mode = 'idle';
		S._lastPanX = undefined;
		S._lastPanY = undefined;
		canvas.style.cursor = 'grab';
		requestRender();
		return;
	}
	if (e.button !== 0) return;

	if (S.mode === 'draw' && S.drawStart && S.drawEnd) {
		finishDraw();
	}

	// Recalculate spawn totals after move/resize
	if (S.mode === 'move' || S.mode === 'resize') {
		updateSpawnSummary();
		updateSpawnStatus();
		updateRegionList();
	}

	// Finalize dynamic entity move: update loc= field
	if (S.mode === 'dyn-move' && S._dynDragEntity) {
		const ent = S._dynDragEntity;
		// Update or insert loc= in fields
		const locStr = `loc=${ent.x} ${ent.y} ${ent.z}`;
		const locIdx = ent.fields.findIndex((f) => f.startsWith('loc='));
		if (locIdx >= 0) {
			ent.fields[locIdx] = locStr;
		} else {
			ent.fields.unshift(locStr);
		}
		dynRederiveEntity(ent);
		showDynProps(ent);
		markDynDirty();
		if (isEntityDiffOpen()) refreshEntityDiff();
	}

	S.mode = 'idle';
	S._lastPanX = undefined;
	S._lastPanY = undefined;
	S._dragStarts = null;
	S._dynDragEntity = null;
	requestRender();
});

canvas.addEventListener('mouseleave', () => {
	if (S.mode === 'pan' || S.mode === 'pan-pending') {
		S.mode = 'idle';
		S._lastPanX = undefined;
		S._lastPanY = undefined;
	}
	if (S.mode === 'dyn-move-pending' || S.mode === 'dyn-move') {
		// Revert position if drag wasn't completed
		if (S._dynDragEntity && S.mode === 'dyn-move') {
			S._dynDragEntity.x = S._dynDragStartX;
			S._dynDragEntity.y = S._dynDragStartY;
			requestRender();
		}
		S.mode = 'idle';
		S._dynDragEntity = null;
	}
});

canvas.addEventListener(
	'wheel',
	(e) => {
		e.preventDefault();
		const { x: sx, y: sy } = canvasOffset(e);
		const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
		const wx = sx / S.zoom + S.viewX;
		const wy = sy / S.zoom + S.viewY;
		S.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, S.zoom * factor));
		S.viewX = wx - sx / S.zoom;
		S.viewY = wy - sy / S.zoom;
		updateZoomDisplay();
		requestRender();
	},
	{ passive: false },
);

// right-click context menu
/* ===================================================================
 *  MERGE REGIONS
 * =================================================================== */

/** Check if selected regions tile a rectangle exactly (no gaps, no overlaps) */
function canMergeSelection() {
	if (S.selection.size < 2) return false;
	const rects = [...S.selection].map((i) => S.regions[i]);

	// All must share the same z range
	const z0 = rects[0].zMin,
		z1 = rects[0].zMax;
	if (!rects.every((r) => r.zMin === z0 && r.zMax === z1)) return false;

	// Compute bounding box
	let bx0 = Infinity,
		by0 = Infinity,
		bx1 = -Infinity,
		by1 = -Infinity;
	let totalArea = 0;
	for (const r of rects) {
		bx0 = Math.min(bx0, r.x);
		by0 = Math.min(by0, r.y);
		bx1 = Math.max(bx1, r.x + r.w);
		by1 = Math.max(by1, r.y + r.h);
		totalArea += r.w * r.h;
	}
	const bboxArea = (bx1 - bx0) * (by1 - by0);

	// Quick check: total area must equal bounding box area
	if (totalArea !== bboxArea) return false;

	// Check no two regions overlap
	const arr = rects;
	for (let i = 0; i < arr.length; i++) {
		for (let j = i + 1; j < arr.length; j++) {
			const a = arr[i],
				b = arr[j];
			if (
				a.x < b.x + b.w &&
				a.x + a.w > b.x &&
				a.y < b.y + b.h &&
				a.y + a.h > b.y
			)
				return false;
		}
	}
	return true;
}

function mergeSelection() {
	if (!canMergeSelection()) return;
	const indices = [...S.selection];
	const rects = indices.map((i) => S.regions[i]);
	const primary = S.regions[S.selectedIdx];

	// Compute bounding box
	let bx0 = Infinity,
		by0 = Infinity,
		bx1 = -Infinity,
		by1 = -Infinity;
	for (const r of rects) {
		bx0 = Math.min(bx0, r.x);
		by0 = Math.min(by0, r.y);
		bx1 = Math.max(bx1, r.x + r.w);
		by1 = Math.max(by1, r.y + r.h);
	}

	pushUndo();

	// Create merged region inheriting properties from primary selection
	const merged = {
		...primary,
		x: bx0,
		y: by0,
		w: bx1 - bx0,
		h: by1 - by0,
	};

	// Delete selected regions in reverse index order, then add merged
	const sorted = indices.sort((a, b) => b - a);
	for (const i of sorted) S.regions.splice(i, 1);
	S.regions.push(merged);

	S.selectedIdx = S.regions.length - 1;
	S.selection.clear();
	S.selection.add(S.selectedIdx);
	markDirty();
	updateRegionList();
	updatePropsPanel();
	updateSpawnStatus();
	requestRender();
}

const $ctxMenu = document.getElementById('ctx-menu');

canvas.addEventListener('contextmenu', (e) => {
	e.preventDefault();
	const { x: sx, y: sy } = canvasOffset(e);
	const world = screenToWorld(sx, sy);
	const idx = hitTestRegion(world.x, world.y);
	if (idx < 0) {
		$ctxMenu.classList.remove('show');
		return;
	}
	if (!S.selection.has(idx)) selectRegion(idx);

	// rebuild menu: static actions + overlapping regions list
	$ctxMenu.innerHTML = '';
	for (const [label, action] of [
		['Center on Region', 'center'],
		['Duplicate', 'duplicate'],
		['Rename Prefix...', 'renamePrefix'],
		['Delete', 'delete'],
	]) {
		const item = document.createElement('div');
		item.className = 'dropdown-item';
		item.dataset.action = action;
		item.textContent = label;
		$ctxMenu.appendChild(item);
	}

	// Merge option for multi-selection
	if (S.selection.size > 1 && canMergeSelection()) {
		const item = document.createElement('div');
		item.className = 'dropdown-item';
		item.dataset.action = 'merge';
		item.textContent = `Merge ${S.selection.size} Regions`;
		$ctxMenu.appendChild(item);
	}

	// list overlapping regions at this point
	const stack = hitTestAllRegions(world.x, world.y);
	if (stack.length > 1) {
		const sep = document.createElement('div');
		sep.className = 'ctx-sep';
		$ctxMenu.appendChild(sep);
		for (const i of stack) {
			const r = S.regions[i];
			const item = document.createElement('div');
			item.className =
				'dropdown-item ctx-region-item' +
				(i === S.selectedIdx ? ' ctx-region-active' : '');
			item.dataset.action = 'select';
			item.dataset.idx = i;
			item.textContent = `${r.name} #${r.id}`;
			$ctxMenu.appendChild(item);
		}
	}

	$ctxMenu.style.left = e.clientX + 'px';
	$ctxMenu.style.top = e.clientY + 'px';
	$ctxMenu.classList.add('show');
});

$ctxMenu.addEventListener('click', (e) => {
	const el = e.target.closest('[data-action]');
	if (!el) return;
	const action = el.dataset.action;
	$ctxMenu.classList.remove('show');
	if (action === 'select') {
		selectRegion(parseInt(el.dataset.idx));
		return;
	}
	if (action === 'center' && S.selectedIdx >= 0) selectAndCenter(S.selectedIdx);
	if (action === 'duplicate' && S.selectedIdx >= 0) {
		pushUndo();
		const src = S.regions[S.selectedIdx];
		S.regions.push({ ...src, id: getNextId(), x: src.x + 10, y: src.y + 10 });
		markDirty();
		updateRegionList();
		selectRegion(S.regions.length - 1);
	}
	if (action === 'renamePrefix' && S.selectedIdx >= 0) openRenamePrefix();
	if (action === 'delete') document.getElementById('btn-delete').click();
	if (action === 'merge' && S.selection.size > 1) mergeSelection();
});

document.addEventListener('mousedown', (e) => {
	if (!$ctxMenu.classList.contains('show')) return;
	if ($ctxMenu.contains(e.target)) return;
	$ctxMenu.classList.remove('show');
});

/* ===================================================================
 *  RENAME PREFIX MODAL
 * =================================================================== */
const $renameOverlay = document.getElementById('rename-prefix');
const $renameFrom = document.getElementById('rename-from');
const $renameTo = document.getElementById('rename-to');
const $renamePick = document.getElementById('rename-pick');
const $renamePreview = document.getElementById('rename-preview');
const $renameOk = document.getElementById('rename-ok');

let _renameIndices = []; // indices of regions being renamed

function detectPrefix(name) {
	// try spawn prefix first
	const sp = getSpawnPrefix(name);
	if (sp) {
		// include the underscore separator following the prefix if present
		if (name.length > sp.length && name[sp.length] === '_')
			return name.substring(0, sp.length + 1);
		return sp;
	}
	// fall back: everything up to and including the last underscore
	const idx = name.lastIndexOf('_');
	if (idx > 0) return name.substring(0, idx + 1);
	return name;
}

function updateRenamePreview() {
	const oldPrefix = $renameFrom.value;
	const newPrefix = $renameTo.value.trim();
	if (!newPrefix || newPrefix === oldPrefix) {
		$renameOk.disabled = true;
		$renamePreview.innerHTML = '';
		return;
	}
	$renameOk.disabled = false;
	const n = _renameIndices.length;
	let html = `<div class="rename-count">${n} region${n > 1 ? 's' : ''} will be renamed:</div>`;
	for (const i of _renameIndices) {
		const r = S.regions[i];
		const suffix = r.name.substring(oldPrefix.length);
		const newName = newPrefix + suffix;
		html +=
			`<div class="rename-row"><span class="old">${esc(r.name)}</span>` +
			`<span class="arrow">\u2192</span><span class="new">${esc(newName)}</span></div>`;
	}
	$renamePreview.innerHTML = html;
}

function collectPrefixes() {
	const prefixes = new Set();
	for (const r of S.regions) {
		let p = detectPrefix(r.name);
		if (!p) continue;
		// normalize: ensure trailing underscore for consistency
		if (!p.endsWith('_') && r.name.length > p.length) p += '_';
		prefixes.add(p);
	}
	return [...prefixes].sort();
}

function openRenamePrefix() {
	if (S.selectedIdx < 0) return;
	_renameIndices = [...S.selection];
	if (_renameIndices.length === 0) _renameIndices = [S.selectedIdx];
	const prefix = detectPrefix(S.regions[S.selectedIdx].name);
	$renameFrom.value = prefix;
	$renameTo.value = prefix;
	$renameOk.disabled = true;
	$renamePreview.innerHTML = `<div class="rename-count">${_renameIndices.length} region${_renameIndices.length > 1 ? 's' : ''} selected</div>`;
	// populate prefix picker
	$renamePick.innerHTML = '<option value="">pick\u2026</option>';
	for (const p of collectPrefixes()) {
		const opt = document.createElement('option');
		opt.value = p;
		opt.textContent = p;
		$renamePick.appendChild(opt);
	}
	$renamePick.value = '';
	$renameOverlay.hidden = false;
	$renameTo.focus();
	$renameTo.select();
}

$renameTo.addEventListener('input', () => {
	$renamePick.value = '';
	updateRenamePreview();
});

$renamePick.addEventListener('change', () => {
	if ($renamePick.value) {
		$renameTo.value = $renamePick.value;
		updateRenamePreview();
	}
});

$renameOk.addEventListener('click', () => {
	const oldPrefix = $renameFrom.value;
	const newPrefix = $renameTo.value.trim();
	if (!newPrefix || newPrefix === oldPrefix || _renameIndices.length === 0)
		return;
	pushUndo();
	for (const i of _renameIndices) {
		const r = S.regions[i];
		r.name = newPrefix + r.name.substring(oldPrefix.length);
	}
	markDirty();
	updateRegionList();
	updatePropsPanel();
	updateSpawnStatus();
	requestRender();
	$renameOverlay.hidden = true;
});

document.getElementById('rename-cancel').addEventListener('click', () => {
	$renameOverlay.hidden = true;
});

$renameOverlay.addEventListener('click', (e) => {
	if (e.target === $renameOverlay) $renameOverlay.hidden = true;
});

$renameOverlay.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') $renameOverlay.hidden = true;
	if (e.key === 'Enter' && !$renameOk.disabled) $renameOk.click();
});

// middle-click pan
canvas.addEventListener('mousedown', (e) => {
	if (e.button === 1) {
		e.preventDefault();
		S.mode = 'pan';
		const { x: sx, y: sy } = canvasOffset(e);
		S.mouseStartScreen = { x: sx, y: sy };
		S._lastPanX = sx;
		S._lastPanY = sy;
	}
});

/* ===================================================================
 *  RESIZE LOGIC
 * =================================================================== */
function applyResize(world) {
	const r = S.regions[S.selectedIdx];
	const o = S.dragStartRegion;
	const dx = Math.round(world.x - S.mouseStartWorld.x);
	const dy = Math.round(world.y - S.mouseStartWorld.y);
	const h = S.resizeHandle;

	if (h === 'nw' || h === 'w' || h === 'sw') {
		r.x = o.x + dx;
		r.w = o.w - dx;
		if (r.w < 1) {
			r.w = 1;
			r.x = o.x + o.w - 1;
		}
	}
	if (h === 'ne' || h === 'e' || h === 'se') {
		r.w = Math.max(1, o.w + dx);
	}
	if (h === 'nw' || h === 'n' || h === 'ne') {
		r.y = o.y + dy;
		r.h = o.h - dy;
		if (r.h < 1) {
			r.h = 1;
			r.y = o.y + o.h - 1;
		}
	}
	if (h === 'sw' || h === 's' || h === 'se') {
		r.h = Math.max(1, o.h + dy);
	}
}

/* ===================================================================
 *  DRAW MODE (new region creation)
 * =================================================================== */
function enterDrawMode(tmpl) {
	S.drawTemplate = tmpl;
	S.drawStart = null;
	S.drawEnd = null;
	S.mode = 'idle';
	$drawHint.style.display = 'block';
	canvas.style.cursor = 'crosshair';
	document.getElementById('btn-new').classList.add('active');
}

function cancelDrawMode() {
	S.drawTemplate = null;
	S.drawStart = null;
	S.drawEnd = null;
	S.mode = 'idle';
	$drawHint.style.display = 'none';
	canvas.style.cursor = 'grab';
	document.getElementById('btn-new').classList.remove('active');
	requestRender();
}

function finishDraw() {
	const x = Math.min(S.drawStart.x, S.drawEnd.x);
	const y = Math.min(S.drawStart.y, S.drawEnd.y);
	const w = Math.max(1, Math.abs(S.drawEnd.x - S.drawStart.x));
	const h = Math.max(1, Math.abs(S.drawEnd.y - S.drawStart.y));
	const tmpl = S.drawTemplate;

	pushUndo();

	if (tmpl.paired) {
		// Town: create JUSTICE_ + CITY_ pair
		const suffix = promptSuffix('Town name (e.g. YEW):');
		if (suffix === null) {
			undoStack.pop();
			cancelDrawMode();
			return;
		}
		const id1 = getNextId();
		const id2 = id1 + 1;
		S.regions.push({
			id: id1,
			x,
			y,
			w,
			h,
			zMin: -10,
			zMax: 127,
			flags: 0,
			name: 'JUSTICE_' + suffix,
			type: 0,
			f1: 0,
			f2: 0,
			f3: 0,
			f4: 0,
			desc: suffix,
		});
		S.regions.push({
			id: id2,
			x,
			y,
			w,
			h,
			zMin: -127,
			zMax: 127,
			flags: 0,
			name: 'CITY_' + suffix,
			type: 0,
			f1: 0,
			f2: 0,
			f3: 0,
			f4: 0,
			desc: '',
		});
		markDirty();
		updateRegionList();
		selectRegion(S.regions.length - 2);
	} else if (tmpl.prefixes && tmpl.prefixes.length > 0) {
		// multi-prefix spawn: create one region per prefix at the same bbox
		const firstIdx = S.regions.length;
		for (const prefix of tmpl.prefixes) {
			const p = prefix.endsWith('_') ? prefix : prefix + '_';
			const suffix = generateSuffix(p);
			const id = getNextId();
			S.regions.push({
				id,
				x,
				y,
				w,
				h,
				zMin: -127,
				zMax: 127,
				flags: 0,
				name: p + suffix,
				type: 0,
				f1: 0,
				f2: 0,
				f3: 0,
				f4: 0,
				desc: '',
			});
		}
		markDirty();
		updateRegionList();
		selectRegion(firstIdx);
	} else {
		let name;
		if (tmpl.prefix === '') {
			name = promptSuffix('Region name:');
			if (!name) {
				undoStack.pop();
				updateUndoButtons();
				cancelDrawMode();
				return;
			}
		} else {
			const suffix = generateSuffix(tmpl.prefix);
			name = tmpl.prefix + suffix;
		}
		const id = getNextId();
		S.regions.push({
			id,
			x,
			y,
			w,
			h,
			zMin: tmpl.zMin,
			zMax: tmpl.zMax,
			flags: 0,
			name,
			type: 0,
			f1: 0,
			f2: 0,
			f3: 0,
			f4: 0,
			desc: '',
		});
		markDirty();
		updateRegionList();
		selectRegion(S.regions.length - 1);
	}

	updateSpawnStatus();
	cancelDrawMode();
}

function promptSuffix(msg) {
	const s = prompt(msg);
	if (s === null) return null;
	return (
		s
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9_]/g, '_') || null
	);
}

function generateSuffix(prefix) {
	let maxNum = 0;
	for (const r of S.regions) {
		if (r.name.startsWith(prefix)) {
			const tail = r.name.substring(prefix.length);
			const n = parseInt(tail);
			if (!isNaN(n) && n > maxNum) maxNum = n;
		}
	}
	return String(maxNum + 1);
}

function getNextId() {
	let maxId = 0;
	for (const r of S.regions) {
		if (r.id > maxId) maxId = r.id;
	}
	return maxId + 1;
}

/* ===================================================================
 *  SELECTION
 * =================================================================== */
function selectRegion(idx, addToSelection, rangeSelect) {
	if (rangeSelect && idx >= 0 && S.selectionAnchor >= 0) {
		const lo = Math.min(S.selectionAnchor, idx);
		const hi = Math.max(S.selectionAnchor, idx);
		S.selection.clear();
		for (let i = lo; i <= hi; i++) S.selection.add(i);
		S.selectedIdx = idx;
	} else if (addToSelection && idx >= 0) {
		if (S.selection.has(idx)) {
			S.selection.delete(idx);
			if (S.selectedIdx === idx)
				S.selectedIdx =
					S.selection.size > 0 ? [...S.selection][S.selection.size - 1] : -1;
		} else {
			S.selection.add(idx);
			S.selectedIdx = idx;
		}
		S.selectionAnchor = idx;
	} else {
		S.selection.clear();
		S.selectedIdx = idx;
		S.selectionAnchor = idx;
		if (idx >= 0) S.selection.add(idx);
	}
	updatePropsPanel();
	updateListSelection();
	requestRender();
	const n = S.selection.size;
	const sel = S.selectedIdx >= 0 ? S.regions[S.selectedIdx] : null;
	document.getElementById('status-selected').textContent = sel
		? `Selected: ${sel.name} (#${sel.id})` + (n > 1 ? ` +${n - 1}` : '')
		: '';
}

function selectAndCenter(idx) {
	selectRegion(idx);
	if (idx >= 0) {
		const r = S.regions[idx];
		const cw = canvas.parentElement.clientWidth;
		const ch = canvas.parentElement.clientHeight;
		S.viewX = r.x + r.w / 2 - cw / S.zoom / 2;
		S.viewY = r.y + r.h / 2 - ch / S.zoom / 2;
		requestRender();
	}
}

/* ===================================================================
 *  REGION LIST UI
 * =================================================================== */
function matchesFilter(r, filter) {
	if (!filter) return true;
	if (r.name.toLowerCase().includes(filter)) return true;
	if (r.desc && r.desc.toLowerCase().includes(filter)) return true;
	if (String(r.id) === filter || '#' + r.id === filter) return true;
	return false;
}

function updateRegionList() {
	const filter = $search.value.trim().toLowerCase();
	$list.innerHTML = '';

	if (S.groupMode === 'name') {
		buildGroupedList(filter);
	} else if (S.groupMode === 'bbox') {
		buildBboxList(filter);
	} else {
		buildFlatList(filter);
	}
}

function buildFlatList(filter) {
	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (!matchesFilter(r, filter)) continue;
		const el = makeListItem(r, i);
		$list.appendChild(el);
	}
}

function buildGroupedList(filter) {
	const groups = new Map();
	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (!matchesFilter(r, filter)) continue;
		if (!groups.has(r.name)) groups.set(r.name, []);
		groups.get(r.name).push(i);
	}

	for (const [name, indices] of groups) {
		const expanded = S.expandedGroups.has(name);
		const col = getRegionColor(name);

		// group header
		const hdr = document.createElement('div');
		hdr.className = 'rlist-group';
		if (S.selectedIdx >= 0 && S.regions[S.selectedIdx].name === name)
			hdr.classList.add('selected');
		hdr.innerHTML =
			`<span class="arrow">${expanded ? '\u25BC' : '\u25B6'}</span>` +
			`<span class="color-dot" style="background:${col.stroke}"></span>` +
			`<span class="rname">${esc(name)}</span>` +
			`<span class="gcount">(${indices.length})</span>`;
		hdr.addEventListener('click', () => {
			if (expanded) S.expandedGroups.delete(name);
			else S.expandedGroups.add(name);
			updateRegionList();
		});
		$list.appendChild(hdr);

		if (expanded) {
			for (const i of indices) {
				const r = S.regions[i];
				const el = makeListItem(r, i, true);
				$list.appendChild(el);
			}
		}
	}
}

function buildBboxList(filter) {
	const bmap = new Map(); // bboxKey -> indices
	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (!matchesFilter(r, filter)) continue;
		const k = bboxKey(r);
		if (!bmap.has(k)) bmap.set(k, []);
		bmap.get(k).push(i);
	}

	for (const [key, indices] of bmap) {
		const r0 = S.regions[indices[0]];
		const expanded = S.expandedGroups.has('bbox:' + key);
		const selKey =
			S.selectedIdx >= 0 ? bboxKey(S.regions[S.selectedIdx]) : null;
		const isSel = key === selKey;

		if (indices.length === 1) {
			// single region at this bbox: show as flat item
			const el = makeListItem(r0, indices[0]);
			$list.appendChild(el);
			continue;
		}

		// group header
		const col = getRegionColor(r0.name);
		const hdr = document.createElement('div');
		hdr.className = 'rlist-group' + (isSel ? ' selected' : '');
		hdr.innerHTML =
			`<span class="arrow">${expanded ? '\u25BC' : '\u25B6'}</span>` +
			`<span class="color-dot" style="background:${col.stroke}"></span>` +
			`<span class="rname">${indices.map((i) => esc(S.regions[i].name)).join(', ')}</span>` +
			`<span class="gcount">(${indices.length})</span>` +
			`<span class="gcoords">${r0.x},${r0.y} ${r0.w}x${r0.h}</span>`;
		hdr.addEventListener('click', (e) => {
			const gk = 'bbox:' + key;
			if (expanded) S.expandedGroups.delete(gk);
			else S.expandedGroups.add(gk);
			selectRegion(indices[0]);
			updateRegionList();
		});
		$list.appendChild(hdr);

		if (expanded) {
			for (const i of indices) {
				const el = makeListItem(S.regions[i], i, true);
				$list.appendChild(el);
			}
		}
	}
}

function makeListItem(r, idx, isChild) {
	const col = getRegionColor(r.name);
	const el = document.createElement('div');
	el.className = 'rlist-item' + (isChild ? ' rlist-child' : '');
	if (idx === S.selectedIdx || S.selection.has(idx))
		el.classList.add('selected');
	el.dataset.idx = idx;
	let html =
		`<span class="color-dot" style="background:${col.stroke}"></span>` +
		`<span class="rname">${esc(r.name)}</span>` +
		`<span class="rid">#${r.id}</span>`;
	if (S.spawnBank) {
		const spawns = getSpawnsForRegion(r.name);
		if (spawns.length > 0) {
			const area = r.w * r.h;
			const t = spawnTotals(spawns, area, r.name);
			const tip = formatSpawnTotals(t, spawns.length);
			html += `<span class="rdensity" title="${tip}">[${compactSpawnBadge(t)}]</span>`;
		}
	}
	el.innerHTML = html;
	el.addEventListener('click', (e) => {
		if (e.shiftKey) {
			selectRegion(idx, false, true);
		} else if (e.ctrlKey || e.metaKey) {
			selectRegion(idx, true);
		} else {
			selectAndCenter(idx);
		}
	});
	return el;
}

function updateListSelection() {
	const items = $list.querySelectorAll('.rlist-item');
	for (const el of items) {
		const idx = parseInt(el.dataset.idx);
		el.classList.toggle(
			'selected',
			idx === S.selectedIdx || S.selection.has(idx),
		);
	}
	const groups = $list.querySelectorAll('.rlist-group');
	if (S.groupMode === 'name') {
		const selName = S.selectedIdx >= 0 ? S.regions[S.selectedIdx].name : null;
		for (const g of groups) {
			const name = g.querySelector('.rname').textContent;
			g.classList.toggle('selected', name === selName);
		}
	} else if (S.groupMode === 'bbox') {
		const selKey =
			S.selectedIdx >= 0 ? bboxKey(S.regions[S.selectedIdx]) : null;
		for (const g of groups) {
			const coords = g.querySelector('.gcoords');
			if (coords && selKey !== null) {
				const r = S.regions[S.selectedIdx];
				g.classList.toggle(
					'selected',
					coords.textContent === `${r.x},${r.y} ${r.w}x${r.h}`,
				);
			} else {
				g.classList.remove('selected');
			}
		}
	}
	// scroll selected into view
	const sel = $list.querySelector('.rlist-item.selected');
	if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function esc(s) {
	const d = document.createElement('span');
	d.textContent = s;
	return d.innerHTML;
}

/* ===================================================================
 *  PROPERTIES PANEL
 * =================================================================== */
const PROP_FIELDS = [
	'id',
	'name',
	'desc',
	'x',
	'y',
	'w',
	'h',
	'zmin',
	'zmax',
	'flags',
	'type',
	'f1',
	'f2',
	'f3',
	'f4',
];
const propEls = {};
for (const f of PROP_FIELDS) propEls[f] = document.getElementById('prop-' + f);

function populateMusicSelect() {
	const sel = propEls.f1;
	sel.innerHTML = '';
	const none = document.createElement('option');
	none.value = '0';
	none.textContent = '0 - none';
	sel.appendChild(none);
	for (const t of MUSIC_TRACKS) {
		if (t.id === 0) continue;
		const o = document.createElement('option');
		o.value = String(t.id);
		o.textContent = `${t.id} - ${t.name} (${t.file})`;
		sel.appendChild(o);
	}
}
populateMusicSelect();

function ensureMusicOption(id) {
	const sel = propEls.f1;
	if ([...sel.options].some((o) => o.value === String(id))) return;
	const o = document.createElement('option');
	o.value = String(id);
	o.textContent = `${id} - (unknown)`;
	sel.appendChild(o);
}

function populateTypeSelect() {
	const sel = propEls.type;
	sel.innerHTML = '';
	for (const t of REGION_TYPES) {
		const o = document.createElement('option');
		o.value = String(t.id);
		o.textContent = `${t.id} - ${t.name}`;
		sel.appendChild(o);
	}
}
populateTypeSelect();

function ensureTypeOption(id) {
	const sel = propEls.type;
	if ([...sel.options].some((o) => o.value === String(id))) return;
	const o = document.createElement('option');
	o.value = String(id);
	o.textContent = `${id} - (unknown)`;
	sel.appendChild(o);
}

function updatePropsPanel() {
	const $regionPanel = document.getElementById('region-panel');
	if (S.selectedIdx < 0) {
		$propsContent.hidden = true;
		$propsEmpty.hidden = $regionPanel.hidden;
		updateSpawnSummary();
		return;
	}
	const wasHidden = $regionPanel.hidden;
	$regionPanel.hidden = false;
	$propsContent.hidden = false;
	$propsEmpty.hidden = true;
	updatePropsFromRegion();
	if (wasHidden) resetPanelHeights(document.getElementById('right-sidebar'));
}

function updatePropsFromRegion() {
	if (S.selectedIdx < 0) return;
	const r = S.regions[S.selectedIdx];
	propEls.id.value = r.id;
	propEls.name.value = r.name;
	propEls.desc.value = r.desc;
	propEls.x.value = r.x;
	propEls.y.value = r.y;
	propEls.w.value = r.w;
	propEls.h.value = r.h;
	propEls.zmin.value = r.zMin;
	propEls.zmax.value = r.zMax;
	propEls.flags.value = r.flags;
	ensureTypeOption(r.type);
	propEls.type.value = r.type;
	ensureMusicOption(r.f1);
	propEls.f1.value = r.f1;
	propEls.f2.value = r.f2;
	propEls.f3.value = r.f3;
	propEls.f4.value = r.f4;
	checkDuplicateId();
	checkOverlap();
	updateSpawnSummary();
	if (typeof syncPrefixPicker === 'function') syncPrefixPicker();
}

function checkOverlap() {
	const warn = document.getElementById('prop-overlap-warn');
	if (S.selectedIdx < 0) {
		warn.hidden = true;
		return;
	}
	const a = S.regions[S.selectedIdx];
	const prefixA = getSpawnPrefix(a.name);
	if (!prefixA) {
		warn.hidden = true;
		return;
	}
	const overlaps = [];
	for (let i = 0; i < S.regions.length; i++) {
		if (i === S.selectedIdx) continue;
		const b = S.regions[i];
		const prefixB = getSpawnPrefix(b.name);
		if (prefixB !== prefixA) continue;
		// AABB overlap test
		if (
			a.x < b.x + b.w &&
			a.x + a.w > b.x &&
			a.y < b.y + b.h &&
			a.y + a.h > b.y
		)
			overlaps.push(b.name);
	}
	if (overlaps.length === 0) {
		warn.hidden = true;
		return;
	}
	warn.hidden = false;
	warn.textContent = `Overlaps ${overlaps.length} same-prefix region${overlaps.length > 1 ? 's' : ''}: ${overlaps.slice(0, 3).join(', ')}${overlaps.length > 3 ? ', ...' : ''}`;
}

function getSpawnPrefix(name) {
	const upper = name.toUpperCase();
	if (!prefixIndex) return null;
	for (const prefix of prefixIndex.keys()) {
		if (upper.startsWith(prefix)) return prefix;
	}
	return null;
}

function updateCoverageWarning() {
	const el = document.getElementById('coverage-warn');
	if (S.regions.length === 0) {
		el.hidden = true;
		return;
	}

	let html = '';

	// region validation
	const issues = validateRegions();
	if (issues.length > 0) {
		html +=
			'<h4>Validation (' +
			issues.length +
			')</h4>' +
			issues.map((i) => `<div class="coverage-row">${esc(i)}</div>`).join('');
	}

	// missing coverage
	if (prefixIndex) {
		const missing = [];
		for (const prefix of prefixIndex.keys()) {
			let found = false;
			for (const r of S.regions) {
				if (
					r.name.toUpperCase().startsWith(prefix) ||
					r.name.toUpperCase() === prefix
				) {
					found = true;
					break;
				}
			}
			if (!found) missing.push(prefix);
		}
		if (missing.length > 0) {
			missing.sort();
			html +=
				'<h4>Missing coverage (' +
				missing.length +
				')</h4>' +
				missing
					.map((p) => `<div class="coverage-row">${esc(p)}</div>`)
					.join('');
		}
	}

	if (!html) {
		el.hidden = true;
		return;
	}
	el.hidden = false;
	el.innerHTML = html;
}

function validateRegions() {
	const issues = [];
	const idCount = new Map();
	const nameSet = new Map(); // name -> indices

	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];

		// duplicate IDs
		if (!idCount.has(r.id)) idCount.set(r.id, []);
		idCount.get(r.id).push(i);

		// track names
		if (!nameSet.has(r.name)) nameSet.set(r.name, []);
		nameSet.get(r.name).push(i);

		// zero or negative area
		if (r.w <= 0 || r.h <= 0)
			issues.push(
				`#${r.id} ${r.name}: zero/negative size (${r.w}\u00d7${r.h})`,
			);

		// outside map bounds
		if (r.x < 0 || r.y < 0 || r.x + r.w > MAP_W || r.y + r.h > MAP_H)
			issues.push(`#${r.id} ${r.name}: outside map bounds`);

		// zMin > zMax
		if (r.zMin > r.zMax)
			issues.push(`#${r.id} ${r.name}: zMin (${r.zMin}) > zMax (${r.zMax})`);

		// very small regions (< 4 tiles)
		if (r.w * r.h < 4 && r.w > 0 && r.h > 0)
			issues.push(
				`#${r.id} ${r.name}: tiny region (${r.w}\u00d7${r.h} = ${r.w * r.h} tiles)`,
			);
	}

	// report duplicate IDs
	for (const [id, indices] of idCount) {
		if (indices.length > 1)
			issues.push(
				`Duplicate ID ${id}: ${indices.map((i) => S.regions[i].name).join(', ')}`,
			);
	}

	return issues;
}

function updateSpawnSummary() {
	const panel = document.getElementById('spawn-summary');
	const list = document.getElementById('spawn-list');
	if (!S.spawnBank || S.selectedIdx < 0) {
		panel.hidden = true;
		return;
	}

	// In bbox mode, show tree for all regions sharing this bbox
	if (S.groupMode === 'bbox') {
		const peers = bboxPeers(S.selectedIdx);
		if (peers.length > 1) {
			updateSpawnTree(panel, list, peers);
			return;
		}
	}

	// Single region: flat list
	const r = S.regions[S.selectedIdx];
	const spawns = getSpawnsForRegion(r.name);
	if (spawns.length === 0) {
		panel.hidden = false;
		list.innerHTML =
			'<div style="font-size:11px;color:#555;font-style:italic">No spawns in this region</div>';
		return;
	}
	panel.hidden = false;
	list.innerHTML = '';
	const area = r.w * r.h;
	const t = spawnTotals(spawns, area, r.name);
	const hdr = document.createElement('div');
	hdr.className = 'spawn-total';
	hdr.textContent = formatSpawnTotals(t, spawns.length);
	list.appendChild(hdr);
	const dens = document.createElement('div');
	dens.className = 'spawn-density';
	dens.textContent = formatNpcDensity(regionNpcDensity(r));
	list.appendChild(dens);
	for (const s of spawns) list.appendChild(makeSpawnRow(s, area, r.name));
}

function updateSpawnTree(panel, list, peerIndices) {
	list.innerHTML = '';
	let anySpawns = false;
	let grandNpcs = 0,
		grandShopkeepers = 0,
		grandGuards = 0,
		grandItems = 0,
		grandOther = 0;
	let totalTemplates = 0;
	const rep = S.regions[peerIndices[0]];
	const area = rep.w * rep.h;
	for (const i of peerIndices) {
		const r = S.regions[i];
		const spawns = getSpawnsForRegion(r.name);
		const col = getRegionColor(r.name);

		// region name header
		const hdr = document.createElement('div');
		hdr.className = 'spawn-tree-hdr';
		hdr.innerHTML =
			`<span class="color-dot" style="background:${col.stroke}"></span>` +
			`<span>${esc(r.name)}</span>`;
		list.appendChild(hdr);

		if (spawns.length === 0) {
			const empty = document.createElement('div');
			empty.className = 'spawn-tree-empty';
			empty.textContent = '(no spawns)';
			list.appendChild(empty);
		} else {
			anySpawns = true;
			totalTemplates += spawns.length;
			const dens = document.createElement('div');
			dens.className = 'spawn-density spawn-tree-child';
			dens.textContent = formatNpcDensity(regionNpcDensity(r));
			list.appendChild(dens);
			const t = spawnTotals(spawns, area, r.name);
			grandNpcs += t.npcs;
			grandShopkeepers += t.shopkeepers;
			grandGuards += t.guards;
			grandItems += t.items;
			grandOther += t.other;
			for (const s of spawns) {
				const row = makeSpawnRow(s, area, r.name);
				row.classList.add('spawn-tree-child');
				list.appendChild(row);
			}
		}
	}
	if (anySpawns) {
		const gt = {
			npcs: grandNpcs,
			shopkeepers: grandShopkeepers,
			guards: grandGuards,
			items: grandItems,
			other: grandOther,
			total:
				grandNpcs + grandShopkeepers + grandGuards + grandItems + grandOther,
		};
		const hdr = document.createElement('div');
		hdr.className = 'spawn-total';
		hdr.textContent = formatSpawnTotals(gt, totalTemplates);
		list.insertBefore(hdr, list.firstChild);
	}
	panel.hidden = !anySpawns && peerIndices.length === 0;
	if (!anySpawns) panel.hidden = true;
	else panel.hidden = false;
}

function makeSpawnRow(s, area, regionName) {
	const isGroup = s.createsNpcs && s.memberCount > 0;
	const base =
		area != null ? spawnCount(area, s.count, regionName) : s.count;
	// group rows read "<instances>x<members per group>" (e.g. 1x5);
	// plain rows read "x<count>"
	const countText = isGroup ? `${base}×${s.memberCount}` : `×${base}`;
	// groups are ITEM-typed templates - colour the row like an item
	const cat = isGroup ? 'item' : spawnCategory(s);
	const row = document.createElement('div');
	row.className = 'spawn-row' + (cat !== 'npc' ? ` spawn-${cat}` : '');
	row.title = 'Click: spawn budget \u00b7 Right-click: template details';
	const tagMap = { shopkeeper: 'S', guard: 'G', item: 'I', other: 'O' };
	const tag = isGroup
		? '<span class="spawn-tag group">GRP</span>'
		: tagMap[cat]
			? `<span class="spawn-tag ${cat}">${tagMap[cat]}</span>`
			: '';
	row.innerHTML =
		`<span class="spawn-id">#${s.id}</span>` +
		tag +
		`<span class="spawn-job">${esc(s.job)}${s.bodyType ? ' [' + esc(s.bodyType) + ']' : ''}</span>` +
		`<span class="spawn-count">${countText}</span>` +
		`<span class="spawn-freq">(f${s.freq})</span>`;
	row.addEventListener('click', () => showSpawnBudget(s.id));
	row.addEventListener('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
		showSpawnContextMenu(e.clientX, e.clientY, s.id);
	});
	return row;
}

// Spawn row context menu
const $spawnCtx = document.getElementById('spawn-ctx');

function showSpawnContextMenu(x, y, templateId) {
	$spawnCtx.innerHTML = '';
	const item = document.createElement('div');
	item.className = 'dropdown-item';
	item.textContent = 'Template Details\u2026';
	item.addEventListener('click', () => {
		$spawnCtx.classList.remove('show');
		showTemplateDetail(templateId);
	});
	$spawnCtx.appendChild(item);

	const item2 = document.createElement('div');
	item2.className = 'dropdown-item';
	item2.textContent = 'Spawn Budget';
	item2.addEventListener('click', () => {
		$spawnCtx.classList.remove('show');
		showSpawnBudget(templateId);
	});
	$spawnCtx.appendChild(item2);

	$spawnCtx.style.left = x + 'px';
	$spawnCtx.style.top = y + 'px';
	$spawnCtx.classList.add('show');
}

document.addEventListener('mousedown', (e) => {
	if (!$spawnCtx.classList.contains('show')) return;
	if ($spawnCtx.contains(e.target)) return;
	$spawnCtx.classList.remove('show');
});

// Template detail popup — formatting helpers

/** Parse dice notation like "1d15+25", "2d4", "80d1", "200", "!1d10".
 *  Returns { min, max, expr } or null. */
function parseDice(s) {
	const t = s.trim();
	// reference to another stat (STR, DEX, INT)
	const ref = t.toUpperCase();
	if (ref === 'STR' || ref === 'DEX' || ref === 'INT') return null;
	// strip leading ! (negation prefix for notoriety)
	const neg = t.startsWith('!');
	const expr = neg ? t.substring(1) : t;
	const m = expr.match(/^(\d+)d(\d+)([+-]\d+)?$/);
	if (m) {
		const n = parseInt(m[1]),
			d = parseInt(m[2]),
			mod = parseInt(m[3] || '0');
		const min = n * 1 + mod,
			max = n * d + mod;
		return { min: neg ? -max : min, max: neg ? -min : max, expr: t };
	}
	// plain number
	const num = parseInt(t);
	if (!isNaN(num)) return { min: num, max: num, expr: t };
	return null;
}

function formatDice(s) {
	const d = parseDice(s);
	if (!d) return esc(s);
	if (d.min === d.max)
		return `${d.min} <span class="td-row-dim">(${esc(d.expr)})</span>`;
	return `${d.min}\u2013${d.max} <span class="td-row-dim">(${esc(d.expr)})</span>`;
}

/** "skill_weapon_slashing" → "Weapon Slashing" */
function formatSkillName(s) {
	return s
		.replace(/^skill_/, '')
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "plain_shirt" → "Plain Shirt" */
function prettifyName(s) {
	return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Parse equipment line: "item color chance" */
function formatEquipment(raw) {
	const parts = raw.trim().split(/\s+/);
	if (parts.length === 0) return esc(raw);
	const item = prettifyName(parts[0]);
	const color = parts.length > 1 ? prettifyName(parts[1]) : '';
	const chance = parts.length > 2 ? parts[2] : '';
	let s = `<span class="td-value">${esc(item)}</span>`;
	if (color && color !== '0')
		s += ` <span class="td-row-dim">${esc(color)}</span>`;
	if (chance && chance !== '1' && chance !== '0')
		s += ` <span class="td-row-dim">\u00d7${esc(chance)}</span>`;
	return s;
}

function resolveTemplateRef(id) {
	if (!S.spawnBank) return null;
	const tmpl = S.spawnBank.get(id);
	if (!tmpl) return null;
	return tmpl.comment || tmpl.job || `#${id}`;
}

function extractSpawnedCreatures(tmpl) {
	const creatures = [];
	const seen = new Set();
	for (const eq of tmpl.equipment) {
		const raw = eq.trim();
		// random group: { id1 wt1 id2 wt2 ... }
		const braceMatch = raw.match(/^\{(.+?)\}/);
		if (braceMatch) {
			const tokens = braceMatch[1].trim().split(/\s+/);
			for (let i = 0; i < tokens.length; i += 2) {
				const id = parseInt(tokens[i]);
				if (id >= 100000 && !seen.has(id - 100000)) {
					seen.add(id - 100000);
					const name = resolveTemplateRef(id - 100000);
					if (name) creatures.push({ id: id - 100000, name });
				}
			}
		} else {
			const tokens = raw.split(/\s+/);
			const id = parseInt(tokens[0]);
			if (id >= 100000 && !seen.has(id - 100000)) {
				seen.add(id - 100000);
				const name = resolveTemplateRef(id - 100000);
				if (name) creatures.push({ id: id - 100000, name });
			}
		}
	}
	return creatures;
}

/** Parse resource line: "category priority weight NODE" */
function formatResource(raw) {
	const parts = raw.trim().split(/\s+/);
	if (parts.length < 4) return esc(raw);
	const cat = prettifyName(parts[0]);
	const pri = parts[1],
		wt = parts[2],
		node = prettifyName(parts[3]);
	const wtLabel = parseInt(wt) > 0 ? '+' + wt : wt;
	return (
		`<span class="td-value">${esc(cat)}</span> ` +
		`<span class="td-row-dim">${esc(node)} (pri ${esc(pri)}, wt ${esc(wtLabel)})</span>`
	);
}

const STAT_LABELS = {
	strength: 'STR',
	dexterity: 'DEX',
	intelligence: 'INT',
	hp: 'HP',
	mana: 'Mana',
	stamina: 'Stam',
};

const TYPE_LABELS = {
	NORMAL: 'NPC',
	GUARD: 'Guard',
	SHOPKEEPER: 'Shopkeeper',
	ANIMAL: 'Animal',
	MONSTER: 'Monster',
	ITEM: 'Item',
};

// Template detail popup
function showTemplateDetail(templateId) {
	const tmpl = S.spawnBank.get(templateId);
	if (!tmpl) return;
	const $el = document.getElementById('tmpl-detail-content');
	let h = '';

	// header
	const typeLabel = TYPE_LABELS[tmpl.typeName.toUpperCase()] || tmpl.typeName;
	h += `<div class="td-header">#${templateId} ${esc(tmpl.comment || tmpl.job)}</div>`;
	h +=
		`<div class="td-sub">${esc(typeLabel)}` +
		(tmpl.bodyType ? ` \u00b7 body ${esc(tmpl.bodyType)}` : '') +
		` \u00b7 weight ${tmpl.freq}</div>`;

	// identity
	const identity = [];
	if (tmpl.job) identity.push(['Job', prettifyName(tmpl.job)]);
	if (tmpl.sex) identity.push(['Sex', prettifyName(tmpl.sex)]);
	if (tmpl.name && tmpl.name !== '000') identity.push(['Name', tmpl.name]);
	if (tmpl.alignment)
		identity.push(['Alignment', prettifyName(tmpl.alignment)]);
	if (tmpl.notoriety) identity.push(['Notoriety', formatDice(tmpl.notoriety)]);
	if (identity.length) {
		h += '<div class="td-section">Identity</div>';
		for (const [l, v] of identity)
			h += `<div class="td-pair"><span class="td-label">${l}</span><span class="td-value">${v}</span></div>`;
	}

	// stats
	const statKeys = [
		'strength',
		'dexterity',
		'intelligence',
		'hp',
		'mana',
		'stamina',
	];
	const hasStats = statKeys.some((k) => tmpl.stats[k]);
	if (hasStats) {
		h += '<div class="td-section">Stats</div>';
		for (const k of statKeys) {
			if (!tmpl.stats[k]) continue;
			const label = STAT_LABELS[k] || k;
			const val = tmpl.stats[k].trim();
			const ref = val.toUpperCase();
			let display;
			if (ref === 'STR' || ref === 'DEX' || ref === 'INT') display = `= ${ref}`;
			else display = formatDice(val);
			h += `<div class="td-pair"><span class="td-label">${label}</span><span class="td-value">${display}</span></div>`;
		}
	}

	// region limits
	if (tmpl.limits.size > 0) {
		h += '<div class="td-section">Region Limits</div>';
		for (const [prefix, count] of tmpl.limits)
			h += `<div class="td-row">${esc(prefix)} \u00d7${count}</div>`;
	}

	// spawned creatures (for ITEM-type egg spawners)
	if (tmpl.typeName && tmpl.typeName.toUpperCase() === 'ITEM') {
		const spawned = extractSpawnedCreatures(tmpl);
		if (spawned.length > 0) {
			h += '<div class="td-section">Spawned Creatures</div>';
			for (const c of spawned)
				h += `<div class="td-pair"><span class="td-label">#${c.id}</span><span class="td-value">${esc(c.name)}</span></div>`;
		}
	}

	// equipment
	if (tmpl.equipment.length > 0) {
		h += '<div class="td-section">Equipment</div>';
		for (const eq of tmpl.equipment)
			h += `<div class="td-row">${formatEquipment(eq)}</div>`;
	}

	// skills
	if (tmpl.skills.length > 0) {
		h += '<div class="td-section">Skills</div>';
		for (const sk of tmpl.skills) {
			const parts = sk.trim().split(/\s+/);
			const name = formatSkillName(parts[0]);
			const val = parts.length > 1 ? formatDice(parts[1]) : '';
			h += `<div class="td-pair"><span class="td-label">${esc(name)}</span><span class="td-value">${val}</span></div>`;
		}
	}

	// resources
	if (tmpl.resources.length > 0) {
		h += '<div class="td-section">Resources</div>';
		for (const res of tmpl.resources)
			h += `<div class="td-row">${formatResource(res)}</div>`;
	}

	// scripts
	if (tmpl.scripts.length > 0) {
		h += '<div class="td-section">Scripts</div>';
		for (const sc of tmpl.scripts)
			h += `<div class="td-row">${esc(prettifyName(sc))}</div>`;
	}

	$el.innerHTML = h;
	document.getElementById('tmpl-detail').hidden = false;
}

document.getElementById('tmpl-detail-close').addEventListener('click', () => {
	document.getElementById('tmpl-detail').hidden = true;
});
document.getElementById('tmpl-detail').addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		document.getElementById('tmpl-detail').hidden = true;
		e.stopPropagation();
	}
});
document.getElementById('tmpl-detail').addEventListener('click', (e) => {
	if (e.target === document.getElementById('tmpl-detail'))
		document.getElementById('tmpl-detail').hidden = true;
});

/* ===================================================================
 *  VALIDATION MODAL
 * =================================================================== */
// Layers an equipped container legitimately occupies in the demo data:
// Right Hand, Backpack, the three NPC shop containers, Bank Box.
const CONTAINER_LAYERS = new Set([0x01, 0x15, 0x1a, 0x1b, 0x1c, 0x1d]);

function runValidation() {
	const errors = []; // structural region problems (sscanf bounds, etc.)
	const regionWarns = []; // soft region issues
	const dynWarns = []; // soft dynamic-entity issues
	const seenIds = new Map();
	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		if (r.desc && r.desc.length > 40)
			errors.push({
				idx: i,
				msg: `desc is ${r.desc.length} chars (binary truncates to 40)`,
			});
		if (r.x < 0 || r.y < 0 || r.x + r.w > MAP_W || r.y + r.h > MAP_H)
			errors.push({
				idx: i,
				msg: `partially off-map (x=${r.x}, y=${r.y}, w=${r.w}, h=${r.h})`,
			});
		if (r.zMin > r.zMax)
			errors.push({ idx: i, msg: `zMin (${r.zMin}) > zMax (${r.zMax})` });
		if (r.w <= 0 || r.h <= 0)
			errors.push({ idx: i, msg: `non-positive dimensions w=${r.w} h=${r.h}` });
		if (r.f1 < 0 || r.f1 > 48)
			regionWarns.push({
				idx: i,
				msg: `music ID ${r.f1} outside 0..48 (client will ignore)`,
			});
		if (r.type < 0 || r.type > 8)
			regionWarns.push({
				idx: i,
				msg: `type ${r.type} outside 0..8 (binary clamps to uint8 but only 0-8 are honored)`,
			});
		if (seenIds.has(r.id))
			errors.push({
				idx: i,
				msg: `duplicate id ${r.id} (also at region #${seenIds.get(r.id)})`,
			});
		else seenIds.set(r.id, i);
		if (!r.desc)
			regionWarns.push({
				idx: i,
				msg: 'empty desc (game falls back to all-caps name)',
			});
	}
	// Dynamic entities (capped so a bad batch can't flood the list):
	//  - equipped item whose tile lacks Wearable/Weapon/Container flags
	//    has no equip art and won't render on the paperdoll;
	//  - a container equipped on a non-container layer.
	if (dynEntities && tileItemFlags) {
		const CAP = 200;
		let n = 0;
		for (const e of dynEntities) {
			if (e.eqpos === undefined || e.eqpos <= 0) continue;
			const slot = LAYER_NAMES[e.eqpos] || 'layer ' + e.eqpos;
			let msg = null;
			if (e.typeId >= 0 && !tileIsEquippable(e.typeId))
				msg = `equipped on ${slot} but tile ${e.typeId} is not wearable (no equip art)`;
			else if (e.type === 'C' && !CONTAINER_LAYERS.has(e.eqpos))
				msg = `container equipped on ${slot} - expected a container layer (Backpack/Bank/shop)`;
			if (!msg) continue;
			if (n < CAP) dynWarns.push({ entity: e, msg });
			n++;
		}
		if (n > CAP)
			dynWarns.push({ msg: `...and ${n - CAP} more dynamic-entity issues` });
	}
	return { errors, regionWarns, dynWarns };
}

function openValidateModal() {
	const { errors, regionWarns, dynWarns } = runValidation();
	const $content = document.getElementById('validate-content');
	$content.innerHTML = '';

	const make = (title, items, cls) => {
		const sec = document.createElement('div');
		sec.className = 'validate-section ' + cls;
		const h = document.createElement('h4');
		h.textContent = `${title} (${items.length})`;
		sec.appendChild(h);
		if (items.length === 0) {
			const e = document.createElement('div');
			e.className = 'validate-empty';
			e.textContent = 'None.';
			sec.appendChild(e);
		} else {
			for (const it of items) {
				const row = document.createElement('div');
				row.className = 'validate-item';
				if (it.entity) {
					row.textContent = `${entityLabel(it.entity)} #${it.entity.id}: ${it.msg}`;
					row.addEventListener('click', () => {
						document.getElementById('validate-modal').hidden = true;
						showDynProps(it.entity);
					});
				} else if (it.idx !== undefined) {
					const r = S.regions[it.idx];
					row.textContent = `${r.name} #${r.id}: ${it.msg}`;
					row.addEventListener('click', () => {
						document.getElementById('validate-modal').hidden = true;
						selectAndCenter(it.idx);
					});
				} else {
					row.textContent = it.msg;
					row.style.cursor = 'default';
				}
				sec.appendChild(row);
			}
		}
		$content.appendChild(sec);
	};

	make('Region Errors', errors, 'validate-error');
	make('Region Warnings', regionWarns, 'validate-warn');
	make('Dynamic Entity Warnings', dynWarns, 'validate-warn');

	const summary = document.createElement('div');
	summary.className = 'validate-empty';
	summary.style.marginTop = '10px';
	const nDyn = dynEntities ? dynEntities.length : 0;
	summary.textContent = `Scanned ${S.regions.length} region${
		S.regions.length === 1 ? '' : 's'
	}${nDyn ? ` and ${nDyn} dynamic entities` : ''}.`;
	$content.appendChild(summary);

	document.getElementById('validate-modal').hidden = false;
}

document
	.getElementById('btn-validate')
	.addEventListener('click', openValidateModal);
document.getElementById('validate-close').addEventListener('click', () => {
	document.getElementById('validate-modal').hidden = true;
});
document.getElementById('validate-modal').addEventListener('click', (e) => {
	if (e.target === document.getElementById('validate-modal'))
		document.getElementById('validate-modal').hidden = true;
});
document.getElementById('validate-modal').addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		document.getElementById('validate-modal').hidden = true;
		e.stopPropagation();
	}
});

function showSpawnBudget(templateId) {
	const panel = document.getElementById('spawn-summary');
	const list = document.getElementById('spawn-list');
	const tmpl = S.spawnBank.get(templateId);
	if (!tmpl) return;

	panel.hidden = false;
	list.innerHTML = '';

	// back link
	const back = document.createElement('div');
	back.className = 'budget-back';
	back.textContent = '\u2190 Back to spawns';
	back.addEventListener('click', () => {
		updateSpawnSummary();
	});
	list.appendChild(back);

	// title
	const title = document.createElement('div');
	title.className = 'budget-title';
	title.textContent = `#${templateId} ${tmpl.job}`;
	list.appendChild(title);

	let totalRegions = 0;

	// for each prefix in this template's regionlimit
	for (const [prefix, limit] of tmpl.limits) {
		const ph = document.createElement('div');
		ph.className = 'budget-prefix';
		ph.textContent = `${prefix} (limit: \u00d7${limit})`;
		list.appendChild(ph);

		// find matching regions
		const matches = [];
		for (let i = 0; i < S.regions.length; i++) {
			const r = S.regions[i];
			if (
				r.name.toUpperCase().startsWith(prefix) ||
				r.name.toUpperCase() === prefix
			) {
				matches.push({ idx: i, r });
			}
		}

		if (matches.length === 0) {
			const empty = document.createElement('div');
			empty.className = 'budget-region';
			empty.style.cssText = 'color: #555; font-style: italic; cursor: default;';
			empty.innerHTML = '<span class="br-name">(no matching regions)</span>';
			list.appendChild(empty);
		} else {
			for (const m of matches) {
				const row = document.createElement('div');
				row.className = 'budget-region';
				// Per-template cap matching CResBankRegion_SpawnInSubRegion (resbank.c:3266-3276)
				const area = m.r.w * m.r.h;
				const cap = spawnCount(area, limit, m.r.name);
				row.innerHTML =
					`<span class="br-name">${esc(m.r.name)}</span>` +
					`<span class="br-cap">${m.r.w}\u00d7${m.r.h} [${cap}]</span>`;
				row.addEventListener('click', () => selectAndCenter(m.idx));
				list.appendChild(row);
			}
			totalRegions += matches.length;
		}
	}

	// total summary
	const total = document.createElement('div');
	total.className = 'budget-total';
	total.textContent = `${totalRegions} region${totalRegions !== 1 ? 's' : ''} across ${tmpl.limits.size} prefix${tmpl.limits.size !== 1 ? 'es' : ''} \u00b7 freq ${tmpl.freq}`;
	list.appendChild(total);
}

function applyPropsToRegion() {
	if (S.selectedIdx < 0) return;
	pushUndo();
	const r = S.regions[S.selectedIdx];
	r.id = parseInt(propEls.id.value) || 0;
	r.name = propEls.name.value.replace(/\s/g, '_') || 'UNNAMED';
	r.desc = propEls.desc.value;
	r.x = parseInt(propEls.x.value) || 0;
	r.y = parseInt(propEls.y.value) || 0;
	r.w = Math.max(1, parseInt(propEls.w.value) || 1);
	r.h = Math.max(1, parseInt(propEls.h.value) || 1);
	r.zMin = clamp(parseInt(propEls.zmin.value) || 0, -127, 127);
	r.zMax = clamp(parseInt(propEls.zmax.value) || 0, -127, 127);
	r.flags = parseInt(propEls.flags.value) || 0;
	r.type = parseInt(propEls.type.value) || 0;
	r.f1 = parseInt(propEls.f1.value) || 0;
	r.f2 = parseInt(propEls.f2.value) || 0;
	r.f3 = parseInt(propEls.f3.value) || 0;
	r.f4 = parseInt(propEls.f4.value) || 0;
	markDirty();
	checkDuplicateId();
	updateRegionList();
	updateSpawnSummary();
	updateSpawnStatus();
	requestRender();
}

function checkDuplicateId() {
	const warn = document.getElementById('prop-id-warn');
	if (S.selectedIdx < 0) {
		warn.hidden = true;
		return;
	}
	const myId = S.regions[S.selectedIdx].id;
	let dup = false;
	for (let i = 0; i < S.regions.length; i++) {
		if (i !== S.selectedIdx && S.regions[i].id === myId) {
			dup = true;
			break;
		}
	}
	warn.hidden = !dup;
	warn.textContent = dup ? 'Warning: duplicate ID ' + myId : '';
}

function clamp(v, lo, hi) {
	return Math.max(lo, Math.min(hi, v));
}

// bind change events
for (const f of PROP_FIELDS) {
	const el = propEls[f];
	el.addEventListener('change', applyPropsToRegion);
}

// prefix picker — replace prefix portion of name when a prefix is selected
const $prefixPick = document.getElementById('prop-prefix-pick');

function populatePrefixPicker() {
	$prefixPick.innerHTML = '<option value=""></option>';
	if (!prefixIndex) return;
	const prefixes = [...prefixIndex.keys()].sort();
	for (const prefix of prefixes) {
		const entries = prefixIndex.get(prefix);
		const opt = document.createElement('option');
		opt.value = prefix;
		opt.textContent = `${prefix} (${entries.length})`;
		$prefixPick.appendChild(opt);
	}
}

function syncPrefixPicker() {
	if (S.selectedIdx < 0) return;
	populatePrefixPicker();
	// pre-select current prefix so the dropdown opens scrolled to it
	const cur = getSpawnPrefix(S.regions[S.selectedIdx].name);
	$prefixPick.value =
		cur && [...$prefixPick.options].some((o) => o.value === cur) ? cur : '';
}

$prefixPick.addEventListener('change', () => {
	if (!$prefixPick.value || S.selectedIdx < 0) return;
	const oldName = propEls.name.value;
	const oldPrefix = detectPrefix(oldName);
	const suffix = oldName.substring(oldPrefix.length);
	const newPrefix = $prefixPick.value;
	const sep =
		!newPrefix.endsWith('_') && suffix && !suffix.startsWith('_') ? '_' : '';
	propEls.name.value = newPrefix + sep + suffix;
	applyPropsToRegion();
});

/* ===================================================================
 *  DELETE
 * =================================================================== */
document.getElementById('props-close').addEventListener('click', () => {
	document.getElementById('region-panel').hidden = true;
	S.selectedIdx = -1;
	S.selection.clear();
	updateRegionList();
	resetPanelHeights(document.getElementById('right-sidebar'));
	requestRender();
});

document.getElementById('btn-delete').addEventListener('click', () => {
	if (S.selection.size === 0) return;
	const n = S.selection.size;
	const msg =
		n === 1
			? `Delete region "${S.regions[S.selectedIdx].name}" (#${S.regions[S.selectedIdx].id})?`
			: `Delete ${n} selected regions?`;
	if (!confirm(msg)) return;
	pushUndo();
	// delete in reverse index order to preserve indices
	const sorted = [...S.selection].sort((a, b) => b - a);
	for (const i of sorted) S.regions.splice(i, 1);
	S.selectedIdx = -1;
	S.selection.clear();
	markDirty();
	updateRegionList();
	updatePropsPanel();
	updateSpawnStatus();
	requestRender();
});

/* ===================================================================
 *  KEYBOARD
 * =================================================================== */
document.addEventListener('keydown', (e) => {
	// escape: cancel draw mode or deselect
	if (e.key === 'Escape') {
		if (S.drawTemplate) {
			cancelDrawMode();
			return;
		}
		selectRegion(-1);
		return;
	}
	// Tab: cycle through overlapping regions
	if (
		e.key === 'Tab' &&
		S.selectedIdx >= 0 &&
		document.activeElement.tagName !== 'INPUT'
	) {
		e.preventDefault();
		const r = S.regions[S.selectedIdx];
		const cx = r.x + r.w / 2,
			cy = r.y + r.h / 2;
		const stack = hitTestAllRegions(cx, cy);
		if (stack.length > 1) {
			const pos = stack.indexOf(S.selectedIdx);
			const next = e.shiftKey
				? stack[(pos - 1 + stack.length) % stack.length]
				: stack[(pos + 1) % stack.length];
			selectRegion(next);
		}
		return;
	}
	// delete selected
	if (
		(e.key === 'Delete' || e.key === 'Backspace') &&
		S.selectedIdx >= 0 &&
		document.activeElement.tagName !== 'INPUT'
	) {
		document.getElementById('btn-delete').click();
		return;
	}
	// F: fit to view
	if (e.key === 'f' && document.activeElement.tagName !== 'INPUT') {
		fitToView();
		return;
	}
	// Ctrl+O: load
	if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
		e.preventDefault();
		document.getElementById('file-input').click();
		return;
	}
	// Ctrl+S: save
	if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
		e.preventDefault();
		saveFile();
		return;
	}
	// arrow keys: nudge selected region
	if (
		['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
		S.selectedIdx >= 0 &&
		document.activeElement.tagName !== 'INPUT'
	) {
		e.preventDefault();
		const step = e.shiftKey ? 10 : 1;
		pushUndo();
		for (const i of S.selection) {
			const r = S.regions[i];
			if (e.key === 'ArrowLeft') r.x -= step;
			if (e.key === 'ArrowRight') r.x += step;
			if (e.key === 'ArrowUp') r.y -= step;
			if (e.key === 'ArrowDown') r.y += step;
		}
		markDirty();
		updatePropsFromRegion();
		requestRender();
		return;
	}
	// Ctrl+C with region selected: let native copy event fire (handled below)
	// Ctrl+V: let native paste event fire (handled below)
	// Ctrl+Z: undo
	if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
		e.preventDefault();
		undo();
		return;
	}
	// Ctrl+Shift+Z or Ctrl+Y: redo
	if (
		(e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
		(e.key === 'y' && (e.ctrlKey || e.metaKey))
	) {
		e.preventDefault();
		redo();
		return;
	}
});

// Copy/paste via system clipboard (works across tabs and origins)
const CLIP_PREFIX = 'REGEDIT:';
const TAB_ID = Math.random().toString(36).substring(2);

document.addEventListener('copy', (e) => {
	if (S.selectedIdx < 0 || document.activeElement.tagName === 'INPUT') return;
	const indices = S.selection.size > 0 ? [...S.selection] : [S.selectedIdx];
	const regions = indices.map((i) => S.regions[i]);
	e.clipboardData.setData(
		'text/plain',
		CLIP_PREFIX + JSON.stringify({ tab: TAB_ID, regions }),
	);
	e.preventDefault();
});

document.addEventListener('paste', (e) => {
	if (document.activeElement.tagName === 'INPUT') return;
	const text = e.clipboardData.getData('text/plain');
	if (!text.startsWith(CLIP_PREFIX)) return;
	e.preventDefault();
	let parsed;
	try {
		parsed = JSON.parse(text.substring(CLIP_PREFIX.length));
	} catch {
		return;
	}
	// support old formats: bare array or bare object
	let sources, sameTab;
	if (parsed && parsed.regions) {
		sources = parsed.regions;
		sameTab = parsed.tab === TAB_ID;
	} else {
		sources = Array.isArray(parsed) ? parsed : [parsed];
		sameTab = false;
	}
	if (sources.length === 0) return;
	const offset = sameTab ? 10 : 0;
	pushUndo();
	const firstIdx = S.regions.length;
	S.selection.clear();
	for (const src of sources) {
		const dup = {
			...src,
			id: getNextId(),
			x: src.x + offset,
			y: src.y + offset,
		};
		S.regions.push(dup);
		S.selection.add(S.regions.length - 1);
	}
	markDirty();
	updateRegionList();
	selectRegion(firstIdx);
	// re-add all pasted to selection
	for (let i = firstIdx; i < S.regions.length; i++) S.selection.add(i);
	requestRender();
});

/* ===================================================================
 *  FILE I/O
 * =================================================================== */
function loadRegionData(buf, filename) {
	const text = new TextDecoder().decode(buf);
	const { version, regions } = parseRegions(text);
	S.version = version;
	S.regions = regions;
	S.baseline = regions.map((r) => ({ ...r }));
	S.filename = filename;
	S.dirty = false;
	S.selectedIdx = -1;
	S.expandedGroups.clear();
	resetUndoHistory();
	updateTitle();
	updateRegionList();
	updatePropsPanel();
	enableButtons(true);
	document.getElementById('status-regions').textContent =
		`Regions: ${S.regions.length}`;
	updateSpawnStatus();
	updateCoverageWarning();
	fitToView();
}

function loadFile(file) {
	const reader = new FileReader();
	reader.onload = (ev) => loadRegionData(ev.target.result, file.name);
	reader.readAsArrayBuffer(file);
}

const REGIONS_PATH = 'rundir/uogolddemo/regions.txt';

function loadDefaultRegions() {
	fetch(REGIONS_PATH)
		.then((r) => {
			if (!r.ok) throw new Error(r.status);
			return r.arrayBuffer();
		})
		.then((buf) => loadRegionData(buf, 'regions.txt'))
		.catch((err) => console.warn('Default regions not loaded:', err.message));
}

function downloadBlob(data, filename, mime) {
	const blob = new Blob([data], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function saveFile() {
	if (S.dirty && S.regions.length > 0) {
		downloadBlob(encodeRegions(), S.filename || 'regions.txt', 'text/plain');
		S.dirty = false;
	}
	if (S.dynDirty && dynEntities) {
		const { idxBuf, datBuf } = encodeDynamic(dynEntities);
		downloadBlob(idxBuf, 'dynidx0.mul', 'application/octet-stream');
		downloadBlob(datBuf, 'dynamic0.mul', 'application/octet-stream');
		S.dynDirty = false;
	}
	updateTitle();
	updateSaveButton();
}

function isDiffOpen() {
	return !document.getElementById('diff-panel').hidden;
}

function markDirty() {
	if (!S.dirty) {
		S.dirty = true;
		updateTitle();
		updateSaveButton();
	}
	if (isDiffOpen()) refreshDiff();
}

function markDynDirty() {
	if (!S.dynDirty) {
		S.dynDirty = true;
		updateTitle();
		updateSaveButton();
	}
}

function updateTitle() {
	let t = 'UO Region Editor';
	if (S.dirty || S.dynDirty) t += ' *';
	document.title = t;
}

function updateSaveButton() {
	const btn = document.getElementById('btn-save');
	const parts = [];
	if (S.dirty && S.regions.length > 0) parts.push('regions.txt');
	if (S.dynDirty) parts.push('dynidx0.mul + dynamic0.mul');
	btn.disabled = parts.length === 0;
	btn.title = parts.length
		? 'Save ' + parts.join(' + ') + ' (Ctrl+S)'
		: 'Save regions.txt (Ctrl+S)';
}

function enableButtons(on) {
	updateSaveButton();
	document.getElementById('btn-region-diff').disabled = !on;
	document.getElementById('btn-clear').disabled = !on;
	document.getElementById('btn-new').disabled = !on;
	document.getElementById('btn-validate').disabled = !on;
}

/* ===================================================================
 *  DIFF VIEW
 * =================================================================== */
const REGION_KEYS = [
	'id',
	'name',
	'desc',
	'x',
	'y',
	'w',
	'h',
	'zMin',
	'zMax',
	'flags',
	'type',
	'f1',
	'f2',
	'f3',
	'f4',
];

function computeDiff() {
	if (!S.baseline) return { added: [], modified: [], deleted: [] };
	const baseById = new Map();
	for (const r of S.baseline) baseById.set(r.id, r);

	const curById = new Map();
	for (const r of S.regions) curById.set(r.id, r);

	const added = [];
	const modified = [];
	const deleted = [];

	for (let i = 0; i < S.regions.length; i++) {
		const r = S.regions[i];
		const base = baseById.get(r.id);
		if (!base) {
			added.push({ region: r, idx: i });
		} else {
			const changes = [];
			for (const k of REGION_KEYS) {
				if (r[k] !== base[k]) changes.push(k);
			}
			if (changes.length > 0)
				modified.push({ region: r, base, changes, idx: i });
		}
	}

	for (const r of S.baseline) {
		if (!curById.has(r.id)) deleted.push({ region: r });
	}

	return { added, modified, deleted };
}

function formatChange(key, oldVal, newVal) {
	return `${key}: ${oldVal} \u2192 ${newVal}`;
}

let diffHighlightIdx = -1; // region index highlighted by diff hover

function openDiff() {
	document.getElementById('diff-panel').hidden = false;
	refreshDiff();
}

function refreshDiff() {
	const { added, modified, deleted } = computeDiff();
	const $content = document.getElementById('diff-content');

	if (added.length === 0 && modified.length === 0 && deleted.length === 0) {
		$content.innerHTML =
			'<div class="diff-empty">No changes since last load.</div>';
		return;
	}

	let html = '';

	if (added.length > 0) {
		html +=
			'<div class="diff-section"><h4 class="diff-added">+ Added (' +
			added.length +
			')</h4>';
		for (const { region: r, idx } of added) {
			html +=
				`<div class="diff-row diff-row-added" data-idx="${idx}" data-rid="${r.id}" data-kind="added">${esc(r.name)} #${r.id}` +
				`<div class="diff-detail">${r.x},${r.y} ${r.w}\u00d7${r.h}</div></div>`;
		}
		html += '</div>';
	}

	if (modified.length > 0) {
		html +=
			'<div class="diff-section"><h4 class="diff-modified">\u2206 Modified (' +
			modified.length +
			')</h4>';
		for (const { region: r, base, changes, idx } of modified) {
			const details = changes
				.map((k) => formatChange(k, base[k], r[k]))
				.join(', ');
			html +=
				`<div class="diff-row diff-row-modified" data-idx="${idx}" data-rid="${r.id}" data-kind="modified">${esc(r.name)} #${r.id}` +
				`<div class="diff-detail">${esc(details)}</div></div>`;
		}
		html += '</div>';
	}

	if (deleted.length > 0) {
		html +=
			'<div class="diff-section"><h4 class="diff-deleted">\u2212 Deleted (' +
			deleted.length +
			')</h4>';
		for (const { region: r } of deleted) {
			html +=
				`<div class="diff-row diff-row-deleted" data-rid="${r.id}" data-kind="deleted">${esc(r.name)} #${r.id}` +
				`<div class="diff-detail">${r.x},${r.y} ${r.w}\u00d7${r.h}</div></div>`;
		}
		html += '</div>';
	}

	$content.innerHTML = html;

	// click to center, hover to highlight, right-click to restore
	$content.querySelectorAll('.diff-row').forEach((el) => {
		const idx = el.dataset.idx !== undefined ? parseInt(el.dataset.idx) : -1;
		const rid = el.dataset.rid !== undefined ? parseInt(el.dataset.rid) : -1;
		const kind = el.dataset.kind;

		if (idx >= 0) {
			el.addEventListener('click', () => {
				if (idx >= 0 && idx < S.regions.length) {
					$content
						.querySelectorAll('.diff-row.diff-active')
						.forEach((r) => r.classList.remove('diff-active'));
					el.classList.add('diff-active');
					selectAndCenter(idx);
				}
			});
			el.addEventListener('mouseenter', () => {
				diffHighlightIdx = idx;
				requestRender();
			});
			el.addEventListener('mouseleave', () => {
				diffHighlightIdx = -1;
				requestRender();
			});
		}

		el.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			let label = 'Restore';
			if (kind === 'added') label = 'Revert (delete added region)';
			else if (kind === 'modified') label = 'Revert to original';
			else if (kind === 'deleted') label = 'Restore deleted region';
			else return;

			$ctxMenu.innerHTML = '';
			const item = document.createElement('div');
			item.className = 'dropdown-item';
			item.textContent = label;
			item.addEventListener('click', () => {
				$ctxMenu.classList.remove('show');
				restoreRegionDiff(kind, rid, idx);
			});
			$ctxMenu.appendChild(item);
			$ctxMenu.style.left = e.clientX + 'px';
			$ctxMenu.style.top = e.clientY + 'px';
			$ctxMenu.classList.add('show');
		});
	});
}

function restoreRegionDiff(kind, regionId, idx) {
	pushUndo();
	if (kind === 'added') {
		// Remove the added region
		const i = S.regions.findIndex((r) => r.id === regionId);
		if (i >= 0) {
			S.regions.splice(i, 1);
			if (S.selectedIdx === i) {
				S.selectedIdx = -1;
				S.selection.clear();
			} else if (S.selectedIdx > i) {
				S.selectedIdx--;
				S.selection.clear();
				if (S.selectedIdx >= 0) S.selection.add(S.selectedIdx);
			}
		}
	} else if (kind === 'modified') {
		// Revert to baseline values
		const base = S.baseline.find((r) => r.id === regionId);
		const cur = S.regions.find((r) => r.id === regionId);
		if (base && cur) {
			for (const k of REGION_KEYS) cur[k] = base[k];
		}
	} else if (kind === 'deleted') {
		// Re-add from baseline
		const base = S.baseline.find((r) => r.id === regionId);
		if (base) S.regions.push({ ...base });
	}
	markDirty();
	updateRegionList();
	updatePropsPanel();
	requestRender();
}

function closeDiff() {
	document.getElementById('diff-panel').hidden = true;
	document.getElementById('btn-region-diff').classList.remove('active');
	diffHighlightIdx = -1;
	resetPanelHeights(document.getElementById('right-sidebar'));
	requestRender();
}

document.getElementById('diff-close').addEventListener('click', closeDiff);

/* ===================================================================
 *  ENTITY DIFF VIEW
 * =================================================================== */
let dynBaseline = null; // snapshot of dynEntities at load time
let entityDiffHighlightEntity = null;

function isEntityDiffOpen() {
	return !document.getElementById('entity-diff-panel').hidden;
}

function computeEntityDiff() {
	if (!dynBaseline || !dynEntities)
		return { added: [], modified: [], deleted: [] };
	const baseById = new Map();
	for (const e of dynBaseline) {
		if (e.id >= 0) baseById.set(e.id, e);
	}
	const curById = new Map();
	for (const e of dynEntities) {
		if (e.id >= 0) curById.set(e.id, e);
	}

	const added = [],
		modified = [],
		deleted = [];

	for (const e of dynEntities) {
		if (e.id < 0) continue;
		const base = baseById.get(e.id);
		if (!base) {
			added.push({ entity: e });
		} else {
			// changes: [{kind:'changed'|'added'|'removed', key, oldVal?, newVal?}]
			const changes = [];
			// Compare parsed fields by key=value maps
			const baseFields = new Map(),
				curFields = new Map();
			for (const f of base.fields || []) {
				const eq = f.indexOf('=');
				if (eq > 0) baseFields.set(f.substring(0, eq), f.substring(eq + 1));
			}
			for (const f of e.fields || []) {
				const eq = f.indexOf('=');
				if (eq > 0) curFields.set(f.substring(0, eq), f.substring(eq + 1));
			}
			for (const [k, v] of curFields) {
				if (!baseFields.has(k))
					changes.push({ kind: 'added', key: k, newVal: v });
				else if (baseFields.get(k) !== v)
					changes.push({
						kind: 'changed',
						key: k,
						oldVal: baseFields.get(k),
						newVal: v,
					});
			}
			for (const [k, v] of baseFields) {
				if (!curFields.has(k))
					changes.push({ kind: 'removed', key: k, oldVal: v });
			}
			if (changes.length > 0) modified.push({ entity: e, base, changes });
		}
	}

	for (const e of dynBaseline) {
		if (e.id >= 0 && !curById.has(e.id)) deleted.push({ entity: e });
	}

	return { added, modified, deleted };
}

function entityLabel(e) {
	const BODY_TYPES_SET = new Set(['S', 'G', 'N', 'M', 'P']);
	const typeLabel = DYN_TYPE_LABELS[e.type]
		? DYN_TYPE_LABELS[e.type].replace(/s$/, '')
		: e.type;
	let name = '';
	if (BODY_TYPES_SET.has(e.type) && e.typeId >= 0) {
		name = BODY_NAMES[e.typeId] || '';
	} else if (e.typeId >= 0 && tileItemNames && tileItemNames.has(e.typeId)) {
		name = tileItemNames.get(e.typeId);
	}
	return name ? `${typeLabel}: ${name}` : typeLabel;
}

function openEntityDiff() {
	document.getElementById('entity-diff-panel').hidden = false;
	document.getElementById('btn-entity-diff').classList.add('active');
	resetPanelHeights(document.getElementById('right-sidebar'));
	refreshEntityDiff();
}

function refreshEntityDiff() {
	const { added, modified, deleted } = computeEntityDiff();
	const $content = document.getElementById('entity-diff-content');

	if (added.length === 0 && modified.length === 0 && deleted.length === 0) {
		$content.innerHTML =
			'<div class="diff-empty">No entity changes since last load.</div>';
		return;
	}

	let html = '';

	if (added.length > 0) {
		html +=
			'<div class="diff-section"><h4 class="diff-added">+ Added (' +
			added.length +
			')</h4>';
		for (const { entity: e } of added) {
			html +=
				`<div class="diff-row diff-row-added" data-id="${e.id}" data-kind="added">${esc(entityLabel(e))} #${e.id}` +
				`<div class="diff-detail">${e.x},${e.y},${e.z}</div></div>`;
		}
		html += '</div>';
	}

	if (modified.length > 0) {
		html +=
			'<div class="diff-section"><h4 class="diff-modified">\u2206 Modified (' +
			modified.length +
			')</h4>';
		for (const { entity: e, changes } of modified) {
			let details = '';
			for (const ch of changes) {
				if (ch.kind === 'changed')
					details += `<div class="diff-detail diff-row-modified">${esc(ch.key)}: ${esc(ch.oldVal)} \u2192 ${esc(ch.newVal)}</div>`;
				else if (ch.kind === 'added')
					details += `<div class="diff-detail diff-row-added">+${esc(ch.key)}=${esc(ch.newVal)}</div>`;
				else if (ch.kind === 'removed')
					details += `<div class="diff-detail diff-row-deleted">\u2212${esc(ch.key)}=${esc(ch.oldVal)}</div>`;
			}
			html += `<div class="diff-row diff-row-modified" data-id="${e.id}" data-kind="modified">${esc(entityLabel(e))} #${e.id}${details}</div>`;
		}
		html += '</div>';
	}

	if (deleted.length > 0) {
		html +=
			'<div class="diff-section"><h4 class="diff-deleted">\u2212 Deleted (' +
			deleted.length +
			')</h4>';
		for (const { entity: e } of deleted) {
			html +=
				`<div class="diff-row diff-row-deleted" data-id="${e.id}" data-kind="deleted">${esc(entityLabel(e))} #${e.id}` +
				`<div class="diff-detail">${e.x},${e.y},${e.z}</div></div>`;
		}
		html += '</div>';
	}

	$content.innerHTML = html;

	// Click to select entity and center on it; right-click to restore
	$content.querySelectorAll('.diff-row').forEach((el) => {
		const id = el.dataset.id !== undefined ? parseInt(el.dataset.id) : -1;
		const kind = el.dataset.kind;

		if (id >= 0 && dynById && dynById.has(id)) {
			el.addEventListener('click', () => {
				const entity = dynById.get(id);
				if (entity) {
					$content
						.querySelectorAll('.diff-row.diff-active')
						.forEach((r) => r.classList.remove('diff-active'));
					el.classList.add('diff-active');
					showDynProps(entity);
					if (entity.x >= 0 && entity.y >= 0) {
						S.viewX = entity.x - canvas.width / (2 * S.zoom * devicePixelRatio);
						S.viewY =
							entity.y - canvas.height / (2 * S.zoom * devicePixelRatio);
						requestRender();
					}
				}
			});
			el.addEventListener('mouseenter', () => {
				entityDiffHighlightEntity = dynById.get(id) || null;
				requestRender();
			});
			el.addEventListener('mouseleave', () => {
				entityDiffHighlightEntity = null;
				requestRender();
			});
		}

		el.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			let label = 'Restore';
			if (kind === 'added') label = 'Revert (remove added entity)';
			else if (kind === 'modified') label = 'Revert to original';
			else if (kind === 'deleted') label = 'Restore deleted entity';
			else return;

			$ctxMenu.innerHTML = '';
			const item = document.createElement('div');
			item.className = 'dropdown-item';
			item.textContent = label;
			item.addEventListener('click', () => {
				$ctxMenu.classList.remove('show');
				restoreEntityDiff(kind, id);
			});
			$ctxMenu.appendChild(item);
			$ctxMenu.style.left = e.clientX + 'px';
			$ctxMenu.style.top = e.clientY + 'px';
			$ctxMenu.classList.add('show');
		});
	});
}

function restoreEntityDiff(kind, entityId) {
	if (kind === 'added') {
		// Remove the added entity
		const i = dynEntities.findIndex((e) => e.id === entityId);
		if (i >= 0) {
			pushDynRemoveUndo(dynEntities[i], i);
			dynEntities.splice(i, 1);
			if (selectedDynEntity && selectedDynEntity.id === entityId)
				showDynProps(null);
			markDynDirty();
		}
	} else if (kind === 'modified') {
		// Revert to baseline
		const base = dynBaseline.find((e) => e.id === entityId);
		const cur = dynEntities.find((e) => e.id === entityId);
		if (base && cur) {
			pushDynMutateUndo(cur);
			cur.x = base.x;
			cur.y = base.y;
			cur.z = base.z;
			cur.typeId = base.typeId;
			cur.cont = base.cont;
			cur.eqpos = base.eqpos;
			cur.fields = [...base.fields];
			dynRederiveEntity(cur);
			if (selectedDynEntity && selectedDynEntity.id === entityId)
				showDynProps(cur);
			markDynDirty();
		}
	} else if (kind === 'deleted') {
		// Re-add from baseline
		const base = dynBaseline.find((e) => e.id === entityId);
		if (base) {
			const restored = { ...base, fields: [...base.fields] };
			dynEntities.push(restored);
			pushDynAddUndo(restored);
			markDynDirty();
		}
	}
	rebuildDynIndices();
	updateDynStatus();
	if (dynPanelOpen) buildDynPanel(document.getElementById('dyn-search').value);
	refreshEntityDiff();
	requestRender();
}

/* ===================================================================
 *  CONTAINER CONTENT EDITING
 * =================================================================== */

/** Smallest unused dynamic-entity serial (>= UO item-serial floor). */
function getNextDynId() {
	let maxId = 0x40000000 - 1;
	if (dynEntities) {
		for (const e of dynEntities) {
			if (e.id > maxId) maxId = e.id;
		}
	}
	return maxId + 1;
}

/** Read a `key=` field's value from an entity, or null. */
function dynFieldValue(entity, key) {
	const f = entity.fields.find((x) => x.startsWith(key + '='));
	return f ? f.substring(key.length + 1) : null;
}

/**
 * Create a new entity of `category` (D/C/W) holding `tileId`, parented
 * to `parent`. When `eqpos` is given (> 0) the entity is equipped on
 * that layer (worn); otherwise it is loose container contents.
 */
function dynAddContainedItem(parent, category, tileId, eqpos) {
	if (!parent || parent.id < 0) return;
	const siblings = dynChildren.get(parent.id) || [];
	const n = siblings.length;
	const inX = 40 + (n % 8) * 14;
	const inY = 40 + Math.floor(n / 8) * 16;
	const cloc =
		dynFieldValue(parent, 'cloc') ||
		dynFieldValue(parent, 'loc') ||
		`${parent.x} ${parent.y} ${parent.z}`;
	const fields = [
		`id=${getNextDynId()}`,
		`type=${tileId}`,
		`cont=${parent.id}`,
		`cloc=${cloc}`,
		`loc=${inX} ${inY} 0`,
	];
	if (eqpos !== undefined && eqpos > 0) fields.push(`eqpos=${eqpos}`);
	const ent = { type: category, fields };
	dynRederiveEntity(ent);
	dynEntities.push(ent);
	pushDynAddUndo(ent);
	rebuildDynIndices();
	markDynDirty();
	updateDynStatus();
	if (dynPanelOpen) buildDynPanel(document.getElementById('dyn-search').value);
	if (isEntityDiffOpen()) refreshEntityDiff();
	showDynProps(parent);
}

/**
 * Delete `entity` and every descendant (BFS over the container graph),
 * since orphaned cont= pointers are invalid. Confirms when more than
 * the entity itself would be removed.
 */
function dynDeleteEntityCascade(entity) {
	const toRemove = [];
	const queue = [entity];
	const seen = new Set();
	while (queue.length) {
		const e = queue.shift();
		if (seen.has(e)) continue;
		seen.add(e);
		toRemove.push(e);
		if (e.id >= 0 && dynChildren.has(e.id)) {
			for (const ch of dynChildren.get(e.id)) queue.push(ch);
		}
	}
	if (toRemove.length > 1) {
		const label = entityLabel(entity);
		if (
			!confirm(
				`Delete ${label} and its ${toRemove.length - 1} contained item${
					toRemove.length - 1 === 1 ? '' : 's'
				}?`,
			)
		)
			return;
	}
	const parentId = entity.cont;
	dynEntities = dynEntities.filter((e) => !seen.has(e));
	window.dynEntities = dynEntities;
	pushDynBatchRemoveUndo(toRemove);
	rebuildDynIndices();
	markDynDirty();
	updateDynStatus();
	if (dynPanelOpen) buildDynPanel(document.getElementById('dyn-search').value);
	if (isEntityDiffOpen()) refreshEntityDiff();
	// Stay on the parent container if there is one; else clear the panel.
	const parent =
		parentId !== undefined && dynById.has(parentId)
			? dynById.get(parentId)
			: null;
	showDynProps(parent);
}

/** A '×' button that cascade-deletes `child` (used on inventory rows). */
function makeInvDelButton(child) {
	const del = document.createElement('button');
	del.type = 'button';
	del.className = 'dyn-prop-del';
	del.textContent = '×';
	del.title = 'Delete item';
	del.addEventListener('click', (e) => {
		e.stopPropagation();
		dynDeleteEntityCascade(child);
	});
	return del;
}

function closeEntityDiff() {
	document.getElementById('entity-diff-panel').hidden = true;
	document.getElementById('btn-entity-diff').classList.remove('active');
	entityDiffHighlightEntity = null;
	resetPanelHeights(document.getElementById('right-sidebar'));
	requestRender();
}

document
	.getElementById('entity-diff-close')
	.addEventListener('click', closeEntityDiff);
document.getElementById('btn-entity-diff').addEventListener('click', (e) => {
	if (isEntityDiffOpen()) closeEntityDiff();
	else openEntityDiff();
	e.currentTarget.blur();
});

/* ===================================================================
 *  TOOLBAR EVENTS
 * =================================================================== */
document.getElementById('btn-load').addEventListener('click', () => {
	document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', (e) => {
	routeDroppedFiles(Array.from(e.target.files));
	e.target.value = '';
});

/** Route a set of user-supplied files to the right loader by name/extension. */
function routeDroppedFiles(files) {
	if (files.length === 0) return;
	const txt = files.find((f) => /\.txt$/i.test(f.name));
	const idxFile = files.find((f) => /dynidx[^.]*\.mul$/i.test(f.name));
	const datFile = files.find(
		(f) => /dynamic[^.]*\.mul$/i.test(f.name) && f !== idxFile,
	);
	if (txt) loadFile(txt);
	if (idxFile && datFile) loadDynamicFromFiles(idxFile, datFile);
	else if (idxFile || datFile)
		alert(
			'Loading dynamic data requires both dynidx0.mul and dynamic0.mul ' +
				'selected together.',
		);
}

document.body.addEventListener('dragover', (e) => {
	if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	}
});
document.body.addEventListener('drop', (e) => {
	if (!e.dataTransfer || !e.dataTransfer.files.length) return;
	e.preventDefault();
	routeDroppedFiles(Array.from(e.dataTransfer.files));
});
document.getElementById('btn-save').addEventListener('click', saveFile);
document.getElementById('btn-region-diff').addEventListener('click', (e) => {
	if (isDiffOpen()) {
		closeDiff();
	} else {
		openDiff();
		document.getElementById('btn-region-diff').classList.add('active');
		resetPanelHeights(document.getElementById('right-sidebar'));
	}
	e.currentTarget.blur();
});
document.getElementById('btn-clear').addEventListener('click', () => {
	if (S.regions.length === 0) return;
	if (!confirm(`Clear all ${S.regions.length} regions?`)) return;
	pushUndo();
	S.regions.length = 0;
	S.selectedIdx = -1;
	S.selection.clear();
	markDirty();
	updateRegionList();
	updatePropsPanel();
	requestRender();
	document.getElementById('status-regions').textContent = 'Regions: 0';
	document.getElementById('status-selected').textContent = '';
	document.getElementById('status-spawn').textContent = '';
});
document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);

// Regions toggle button
document.getElementById('btn-regions').addEventListener('click', () => {
	const regionList = document.getElementById('region-list-panel');
	const regionProps = document.getElementById('region-panel');
	const showing = regionList.hidden; // if currently hidden, we're about to show
	regionList.hidden = !showing;
	regionProps.hidden = !showing;
	if (!showing) {
		S.selectedIdx = -1;
		S.selection.clear();
		$propsContent.hidden = true;
		$propsEmpty.hidden = true;
		updateRegionList();
	} else {
		$propsContent.hidden = true;
		$propsEmpty.hidden = false;
	}
	document.getElementById('btn-regions').classList.toggle('active', showing);
	resetPanelHeights(document.getElementById('sidebar'));
	resetPanelHeights(document.getElementById('right-sidebar'));
	requestRender();
});

// Region list close button
document.getElementById('region-list-close').addEventListener('click', () => {
	document.getElementById('region-list-panel').hidden = true;
	document.getElementById('btn-regions').classList.remove('active');
	resetPanelHeights(document.getElementById('sidebar'));
});

// Ground-altitude map: one signed-byte z per tile, row-major (y*MAP_W + x).
let heightmap = null;
function loadHeightmap() {
	fetch('heightmap.bin.gz')
		.then((r) => {
			if (!r.ok) throw new Error(r.status);
			return new Response(
				r.body.pipeThrough(new DecompressionStream('gzip')),
			).arrayBuffer();
		})
		.then((buf) => {
			heightmap = new Uint8Array(buf);
		})
		.catch((err) => {
			console.warn('Heightmap not loaded:', err.message);
		});
}

// Load Bank
const BANK_PATH = 'rundir/bank/';

function loadBank() {
	fetch(BANK_PATH + 'templatestable.dat')
		.then((r) => {
			if (!r.ok) throw new Error(r.status);
			return r.arrayBuffer();
		})
		.then((buf) => {
			parseTemplateTable(new TextDecoder().decode(buf));
			injectSpawnMenuItem();
			updateRegionList();
			updateSpawnSummary();
			updateCoverageWarning();
			requestRender();
			document.getElementById('status-bank').textContent =
				`Bank: ${S.spawnBank.size} templates`;
			updateSpawnStatus();
		})
		.catch((err) => {
			console.warn('Spawn bank not loaded:', err.message);
		});
}

// Spawn picker
function injectSpawnMenuItem() {
	if (document.getElementById('spawn-menu-item')) return;
	const item = document.createElement('div');
	item.id = 'spawn-menu-item';
	item.className = 'dropdown-item spawn-item';
	item.textContent = 'Spawn Region\u2026';
	item.addEventListener('click', () => {
		document.getElementById('template-menu').classList.remove('show');
		openSpawnPicker();
	});
	const menu = document.getElementById('template-menu');
	menu.insertBefore(item, menu.firstChild);
}

// Spawn picker state: accumulated prefix selection
let spawnPickerSelection = new Set();

function openSpawnPicker() {
	spawnPickerSelection.clear();
	document.getElementById('spawn-search').value = '';
	document.getElementById('spawn-mode-sel').value = 'creature';
	setSpawnPickerMode('creature');
	populateCreatureList('');
	updatePrefixSelect();
	renderSpawnSelection();
	document.getElementById('spawn-picker').hidden = false;
	document.getElementById('spawn-search').focus();
}

function setSpawnPickerMode(mode) {
	document.getElementById('spawn-creature-panel').hidden = mode !== 'creature';
	document.getElementById('spawn-prefix-panel').hidden = mode !== 'prefix';
	document.getElementById('spawn-search').placeholder =
		mode === 'creature' ? 'Filter creatures...' : 'Filter prefixes...';
	if (mode === 'prefix')
		populatePrefixBrowseList(document.getElementById('spawn-search').value);
}

document.getElementById('spawn-mode-sel').addEventListener('change', (e) => {
	setSpawnPickerMode(e.target.value);
});

function populatePrefixBrowseList(filter) {
	const sel = document.getElementById('spawn-prefix-list');
	sel.innerHTML = '';
	if (!prefixIndex) return;
	const fl = filter.toLowerCase();
	const prefixes = [...prefixIndex.keys()].sort();
	for (const prefix of prefixes) {
		if (fl && !prefix.toLowerCase().includes(fl)) continue;
		const entries = prefixIndex.get(prefix);
		const opt = document.createElement('option');
		opt.value = prefix;
		opt.textContent = `${prefix} (${entries.length} template${entries.length !== 1 ? 's' : ''})`;
		sel.appendChild(opt);
	}
}

document
	.getElementById('spawn-prefix-add-btn')
	.addEventListener('click', () => {
		const sel = document.getElementById('spawn-prefix-list');
		for (const opt of sel.selectedOptions) {
			spawnPickerSelection.add(opt.value);
		}
		renderSpawnSelection();
	});

function populateCreatureList(filter) {
	const sel = document.getElementById('spawn-creature-sel');
	const prev = sel.value;
	sel.innerHTML = '';
	const fl = filter.toLowerCase();
	const entries = [...S.spawnBank.entries()]
		.filter(([id, t]) => t.limits.size > 0)
		.sort((a, b) => a[0] - b[0]);
	for (const [id, t] of entries) {
		if (
			fl &&
			!String(id).includes(fl) &&
			!t.job.toLowerCase().includes(fl) &&
			!(t.bodyType && t.bodyType.toLowerCase().includes(fl))
		)
			continue;
		const opt = document.createElement('option');
		opt.value = id;
		const label = t.bodyType ? `${t.job} [${t.bodyType}]` : t.job;
		opt.textContent = `#${id} ${label} (f${t.freq})`;
		sel.appendChild(opt);
	}
	if (prev && sel.querySelector(`option[value="${prev}"]`)) sel.value = prev;
	else if (sel.options.length > 0) sel.selectedIndex = 0;
	updatePrefixSelect();
}

document.getElementById('spawn-search').addEventListener('input', (e) => {
	const mode = document.getElementById('spawn-mode-sel').value;
	if (mode === 'creature') populateCreatureList(e.target.value);
	else populatePrefixBrowseList(e.target.value);
});

document
	.getElementById('spawn-creature-sel')
	.addEventListener('change', updatePrefixSelect);

function updatePrefixSelect() {
	const csel = document.getElementById('spawn-creature-sel');
	const psel = document.getElementById('spawn-prefix-sel');
	const info = document.getElementById('spawn-picker-info');
	psel.innerHTML = '';
	info.textContent = '';
	const id = parseInt(csel.value);
	if (!id || !S.spawnBank.has(id)) return;
	const t = S.spawnBank.get(id);
	const seen = new Set();
	for (const [prefix, count] of t.limits) {
		seen.add(prefix);
		const opt = document.createElement('option');
		opt.value = prefix;
		opt.textContent = `${prefix} (\u00d7${count})`;
		psel.appendChild(opt);
	}
	let indirectCount = 0;
	if (groupPrefixIndex) {
		for (const entry of groupPrefixIndex.get(id) || []) {
			if (seen.has(entry.prefix)) continue;
			seen.add(entry.prefix);
			const opt = document.createElement('option');
			opt.value = entry.prefix;
			opt.textContent = `${entry.prefix} (\u00d7${entry.count}) \u2014 via ${entry.groupJob}`;
			opt.className = 'spawn-opt-indirect';
			psel.appendChild(opt);
			indirectCount++;
		}
	}
	info.textContent = indirectCount
		? `Weight: ${t.freq} (+${indirectCount} via group${indirectCount > 1 ? 's' : ''})`
		: `Weight: ${t.freq}`;
}

// Add button: add current prefix to selection
document.getElementById('spawn-add-btn').addEventListener('click', () => {
	const psel = document.getElementById('spawn-prefix-sel');
	if (psel.value) {
		spawnPickerSelection.add(psel.value);
		renderSpawnSelection();
	}
});

// Double-click creature: add all its prefixes at once
document
	.getElementById('spawn-creature-sel')
	.addEventListener('dblclick', () => {
		const id = parseInt(document.getElementById('spawn-creature-sel').value);
		if (!id || !S.spawnBank.has(id)) return;
		const t = S.spawnBank.get(id);
		for (const prefix of t.limits.keys()) spawnPickerSelection.add(prefix);
		if (groupPrefixIndex) {
			for (const entry of groupPrefixIndex.get(id) || [])
				spawnPickerSelection.add(entry.prefix);
		}
		renderSpawnSelection();
	});

function renderSpawnSelection() {
	const $list = document.getElementById('spawn-sel-list');
	const $ok = document.getElementById('spawn-picker-ok');
	$list.innerHTML = '';
	if (spawnPickerSelection.size === 0) {
		$list.innerHTML =
			'<span class="spawn-sel-empty">No prefixes selected. Add prefixes or double-click a creature.</span>';
		$ok.disabled = true;
		return;
	}
	$ok.disabled = false;
	for (const prefix of spawnPickerSelection) {
		const tag = document.createElement('span');
		tag.className = 'spawn-sel-tag';
		// tooltip: list creatures that spawn with this prefix
		const entries = prefixIndex ? prefixIndex.get(prefix) : null;
		if (entries && entries.length > 0) {
			const names = entries.map((e) => `${e.job} #${e.id} (\u00d7${e.count})`);
			tag.title = names.join('\n');
		}
		tag.innerHTML = `${esc(prefix)} <span class="sel-remove" title="Remove">\u00d7</span>`;
		tag.querySelector('.sel-remove').addEventListener('click', () => {
			spawnPickerSelection.delete(prefix);
			renderSpawnSelection();
		});
		$list.appendChild(tag);
	}
}

document.getElementById('spawn-picker-ok').addEventListener('click', () => {
	if (spawnPickerSelection.size === 0) return;
	const prefixes = [...spawnPickerSelection];
	closeSpawnPicker();
	if (prefixes.length === 1) {
		const p = prefixes[0];
		enterDrawMode({
			label: 'Spawn: ' + p,
			prefix: p.endsWith('_') ? p : p + '_',
			zMin: -127,
			zMax: 127,
		});
	} else {
		enterDrawMode({
			label: 'Spawn: ' + prefixes.length + ' prefixes',
			prefixes,
			zMin: -127,
			zMax: 127,
		});
	}
});

document
	.getElementById('spawn-picker-cancel')
	.addEventListener('click', closeSpawnPicker);

function closeSpawnPicker() {
	document.getElementById('spawn-picker').hidden = true;
}

document.getElementById('spawn-picker').addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		closeSpawnPicker();
		e.stopPropagation();
	}
});

// New region dropdown
const $tmplMenu = document.getElementById('template-menu');
for (const tmpl of TEMPLATES) {
	const item = document.createElement('div');
	item.className = 'dropdown-item';
	item.textContent = tmpl.label;
	if (tmpl.prefix && !tmpl.paired) {
		const hint = document.createElement('span');
		hint.className = 'tmpl-hint';
		hint.textContent = tmpl.prefix;
		item.appendChild(hint);
	}
	item.addEventListener('click', () => {
		$tmplMenu.classList.remove('show');
		enterDrawMode(tmpl);
	});
	$tmplMenu.appendChild(item);
}

document.getElementById('btn-new').addEventListener('click', (e) => {
	if (S.drawTemplate) {
		cancelDrawMode();
		return;
	}
	$tmplMenu.classList.toggle('show');
});

// close dropdown on outside click
document.addEventListener('click', (e) => {
	if (!e.target.closest('#new-dropdown')) {
		$tmplMenu.classList.remove('show');
	}
});

// group toggle
document.getElementById('sel-group').addEventListener('change', (e) => {
	S.groupMode = e.target.value;
	S.expandedGroups.clear();
	updateRegionList();
	requestRender();
});

// labels toggle
document.getElementById('chk-labels').addEventListener('change', (e) => {
	S.showLabels = e.target.checked;
	requestRender();
});
document.getElementById('chk-labels').checked = false;

document.getElementById('chk-heatmap').addEventListener('change', (e) => {
	S.showHeatmap = e.target.checked;
	requestRender();
});

// fit
document.getElementById('btn-fit').addEventListener('click', fitToView);

// search
$search.addEventListener('input', updateRegionList);

/* ===================================================================
 *  ZOOM DISPLAY
 * =================================================================== */
function updateZoomDisplay() {
	const pct = Math.round(S.zoom * 100) + '%';
	document.getElementById('zoom-display').textContent = pct;
	document.getElementById('status-zoom').textContent = 'Zoom: ' + pct;
}

function fitToView() {
	const cw = canvas.parentElement.clientWidth;
	const ch = canvas.parentElement.clientHeight;
	S.zoom = Math.min(cw / MAP_W, ch / MAP_H);
	S.viewX = -(cw / S.zoom - MAP_W) / 2;
	S.viewY = -(ch / S.zoom - MAP_H) / 2;
	updateZoomDisplay();
	requestRender();
}

/* ===================================================================
 *  UNSAVED CHANGES WARNING
 * =================================================================== */
window.addEventListener('beforeunload', (e) => {
	if (S.dirty) {
		e.preventDefault();
		return '';
	}
});

/* ===================================================================
 *  WINDOW RESIZE
 * =================================================================== */
window.addEventListener('resize', () => requestRender());

/* ===================================================================
 *  DYNAMIC ENTITY OVERLAY
 * =================================================================== */

// Tiledata item caches: itemId -> name string / -> uint32 flags
let tileItemNames = null;
let tileItemFlags = null;

const TILEDATA_PATH = 'rundir/tiledata.mul';
const LAND_GROUPS = 512;
const LAND_TILE_SIZE = 26;
const LAND_GROUP_SIZE = 4 + 32 * LAND_TILE_SIZE;
const ITEM_TILE_SIZE = 37;
const ITEM_GROUP_SIZE = 4 + 32 * ITEM_TILE_SIZE;
const LAND_SECTION_END = LAND_GROUPS * LAND_GROUP_SIZE;
// tiledata item-tile flag bits (uint32 at record offset 0)
const TILEFLAG_WEAPON = 0x00000002;
const TILEFLAG_CONTAINER = 0x00200000;
const TILEFLAG_WEARABLE = 0x00400000;

function parseTiledata(buf) {
	const data = new Uint8Array(buf);
	const view = new DataView(data.buffer, data.byteOffset, data.length);
	const names = new Map();
	const flags = new Map();
	const numItemGroups = Math.floor(
		(data.length - LAND_SECTION_END) / ITEM_GROUP_SIZE,
	);
	for (let g = 0; g < numItemGroups; g++) {
		for (let i = 0; i < 32; i++) {
			const rec =
				LAND_SECTION_END + g * ITEM_GROUP_SIZE + 4 + i * ITEM_TILE_SIZE;
			if (rec + ITEM_TILE_SIZE > data.length) break;
			flags.set(g * 32 + i, view.getUint32(rec, true));
			const off = rec + 17;
			let end = off;
			while (end < off + 20 && data[end] !== 0) end++;
			if (end > off) {
				const name = new TextDecoder('latin1').decode(data.subarray(off, end));
				names.set(g * 32 + i, name);
			}
		}
	}
	return { names, flags };
}

/** True if a tile's flags indicate it can be worn (has equip art). */
function tileIsEquippable(typeId) {
	if (!tileItemFlags || !tileItemFlags.has(typeId)) return true; // unknown: don't warn
	const fl = tileItemFlags.get(typeId);
	return (
		(fl & (TILEFLAG_WEARABLE | TILEFLAG_WEAPON | TILEFLAG_CONTAINER)) !== 0
	);
}

const DYN_PATH = 'rundir/uogolddemo/';

let dynEntities = null; // [{type, typeId, x, y, z, id, fields, cont?, eqpos?}, ...]
let dynByCategory = null; // Map<typeMarker, [{typeId, entities}]> structured index
let dynById = null; // Map<serial, entity> for container graph lookups
let dynChildren = null; // Map<serial, entity[]> parent serial -> child entities
let dynPanelOpen = false;
let dynExpandedCats = new Set();
let selectedDynEntity = null; // currently selected dynamic entity

// Selection state: which categories and sub-types are checked
const dynCheckedCats = new Set(); // type markers: 'D','C','W','E',...
const dynCheckedTypes = new Set(); // specific typeId numbers
// When a category is fully checked, we use dynCheckedCats; individual sub-types use dynCheckedTypes
// An entity is visible if: dynCheckedCats.has(e.type) OR dynCheckedTypes.has(typeKey)
// where typeKey = `${e.type}:${e.typeId}`

const DYN_TYPE_LABELS = {
	D: 'Items',
	C: 'Containers',
	W: 'Wearables',
	B: 'Bulletin Boards',
	S: 'Shopkeepers',
	G: 'Guards',
	N: 'NPCs',
	M: 'Mobiles',
	E: 'Eggs',
	P: 'Players',
	X: 'Multis',
	Z: 'Signs',
};
const DYN_TYPE_ORDER = [
	'E',
	'D',
	'C',
	'W',
	'Z',
	'B',
	'S',
	'G',
	'N',
	'M',
	'P',
	'X',
];
const DYN_CAT_COLORS = {
	E: '#e8a040',
	D: '#ff4444',
	C: '#44aaff',
	W: '#ff8844',
	B: '#44dddd',
	S: '#4ec9b0',
	G: '#ffcc00',
	N: '#aa66ff',
	M: '#ff66aa',
	P: '#ffffff',
	X: '#888888',
	Z: '#66ccff',
};

// Creature body-graphic ID to name. Generated from the demo bank data
// (bank/templatestable.dat <type NORMAL> tokens resolved via bank/defines);
// the defines symbols are singularised and abbreviations expanded for display.
const BODY_NAMES = {
	1: 'Ogre',
	3: 'Zombie',
	4: 'Gargoyle',
	5: 'Eagle',
	6: 'Forest Bird',
	7: 'Orc Captain',
	8: 'Corpser',
	9: 'Daemon',
	10: 'Daemon With Sword',
	12: 'Dragon',
	13: 'Air Elemental',
	14: 'Earth Elemental',
	15: 'Fire Elemental',
	16: 'Water Elemental',
	17: 'Orc',
	18: 'Ettin',
	21: 'Giant Serpent',
	22: 'Gazer',
	24: 'Liche',
	26: 'Ghost',
	28: 'Giant Spider',
	29: 'Gorilla',
	30: 'Harpy',
	31: 'Headless One',
	33: 'Lizard Man',
	35: 'Lizard Man',
	36: 'Lizard Man',
	39: 'Mongbat',
	42: 'Ratman',
	44: 'Ratman',
	45: 'Ratman',
	47: 'Reaper',
	48: 'Giant Scorpion',
	50: 'Bone Mage',
	51: 'Slime',
	52: 'Silver Serpent',
	53: 'Troll',
	54: 'Troll',
	55: 'Troll',
	56: 'Skeleton',
	57: 'Bone Knight',
	58: 'Wisp',
	59: 'Dragon',
	60: 'Drake',
	61: 'Drake',
	150: 'Sea Serpent',
	151: 'Dolphin',
	200: 'Horse',
	201: 'Cat',
	202: 'Alligator',
	203: 'Pig',
	204: 'Horse',
	205: 'Rabbit',
	207: 'Woolly Sheep',
	208: 'Chicken',
	209: 'Goat',
	211: 'Black Bear',
	212: 'Grizzly',
	213: 'Polar Bear',
	214: 'Cougar',
	215: 'Giant Rat',
	216: 'Cow',
	217: 'Dog',
	220: 'Llama',
	221: 'Walrus',
	225: 'Timber Wolf',
	226: 'Horse',
	228: 'Horse',
	231: 'Cow',
	232: 'Bull',
	233: 'Bull',
	234: 'Stag',
	237: 'Doe',
	238: 'Sewer Rat',
	290: 'Big Pig',
	291: 'Pack Horse',
	292: 'Pack Llama',
	400: 'Human Male',
	401: 'Human Female',
	574: 'Blade Spirit',
};

// Resource type ID → name (from restypes.mul / resimg.c)
const RES_NAMES = {
	1: 'insects',
	3: 'caves',
	4: 'cropland',
	8: 'crops',
	9: 'darkness',
	10: 'dead logs',
	11: 'dungeons',
	13: 'eggs',
	15: 'fish',
	18: 'foliage',
	19: 'forest',
	20: 'fruit',
	21: 'mushrooms',
	27: 'grass',
	35: 'houses',
	39: 'jungle',
	42: 'magic',
	43: 'meat',
	44: 'metal',
	45: 'mountains',
	46: 'food',
	49: 'sand',
	52: 'snow',
	55: 'swamp',
	57: 'water',
	61: 'wood',
	71: 'dirt',
	73: 'coastline',
	77: 'lava',
	100: 'home',
};

// Equipment layer / eqpos value -> slot name (UO wire-protocol layers).
const LAYER_NAMES = {
	0x01: 'Right Hand',
	0x02: 'Left Hand',
	0x03: 'Footwear',
	0x04: 'Pants',
	0x05: 'Inner Shirt',
	0x06: 'Helm',
	0x07: 'Gloves',
	0x08: 'Ring',
	0x09: 'Talisman',
	0x0a: 'Neck',
	0x0b: 'Hair',
	0x0c: 'Waist',
	0x0d: 'Tunic',
	0x0e: 'Bracelet',
	0x0f: 'Face',
	0x10: 'Facial Hair',
	0x11: 'Outer Shirt',
	0x12: 'Earrings',
	0x13: 'Arms',
	0x14: 'Cloak',
	0x15: 'Backpack',
	0x16: 'Robe',
	0x17: 'Outer Leggings',
	0x18: 'Inner Leggings',
	0x19: 'Mount',
	0x1a: 'Sell Container',
	0x1b: 'Bought Container',
	0x1c: 'Buy Container',
	0x1d: 'Bank Box',
};

function parseDynamic(idxBuf, dataBuf) {
	const idx = new Uint8Array(idxBuf);
	const dat = new Uint8Array(dataBuf);
	const numBlocks = Math.floor(idx.length / 12);
	const idxView = new DataView(idx.buffer, idx.byteOffset, idx.length);
	const entities = [];

	for (let bi = 0; bi < numBlocks; bi++) {
		const offset = idxView.getInt32(bi * 12, true);
		const length = idxView.getInt32(bi * 12 + 4, true);
		if (offset < 0 || length < 1) continue;
		if (offset + length > dat.length) continue;

		const blockEnd = offset + length;
		let pos = offset;
		let curType = null,
			curTypeId = -1,
			curLoc = null,
			curId = -1,
			curRes = null,
			curFields = null;
		let curCont = -1,
			curEqpos = -1;

		function emitEntity() {
			if (curType && (curLoc || curCont >= 0)) {
				const e = {
					type: curType,
					typeId: curTypeId,
					x: curLoc ? curLoc[0] : -1,
					y: curLoc ? curLoc[1] : -1,
					z: curLoc ? curLoc[2] : 0,
					id: curId,
					fields: curFields || [],
					cont: curCont >= 0 ? curCont : undefined,
					eqpos: curEqpos >= 0 ? curEqpos : undefined,
				};
				if (curType === 'E' && curRes && curRes.length > 0) {
					curRes.sort((a, b) => a - b);
					e.resKey = curRes.join(',');
				}
				entities.push(e);
			}
		}

		function resetCur() {
			curType = null;
			curTypeId = -1;
			curLoc = null;
			curId = -1;
			curRes = null;
			curFields = null;
			curCont = -1;
			curEqpos = -1;
		}

		while (pos < blockEnd) {
			let nul = dat.indexOf(0, pos);
			if (nul < 0 || nul > blockEnd) nul = blockEnd;
			const sLen = nul - pos;

			if (sLen === 0) {
				emitEntity();
				resetCur();
				pos = nul + 1;
				continue;
			}

			const c0 = dat[pos],
				c1 = sLen > 1 ? dat[pos + 1] : 0;
			const s = new TextDecoder('latin1').decode(dat.subarray(pos, nul));

			if (c0 === 0x40 && c1 === 0x3d && sLen === 3) {
				emitEntity();
				curType = String.fromCharCode(dat[pos + 2]);
				curTypeId = -1;
				curLoc = null;
				curId = -1;
				curRes = null;
				curFields = [];
			} else if (curType) {
				if (!curFields) curFields = [];
				if (s !== 'end') curFields.push(s);
				if (s.startsWith('type=')) curTypeId = parseInt(s.substring(5));
				else if (s.startsWith('loc=')) {
					const parts = s.substring(4).split(' ');
					if (parts.length >= 3) {
						const x = parseInt(parts[0]),
							y = parseInt(parts[1]),
							z = parseInt(parts[2]);
						if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) curLoc = [x, y, z];
					}
				} else if (s.startsWith('id=')) curId = parseInt(s.substring(3));
				else if (s.startsWith('cont=')) curCont = parseInt(s.substring(5));
				else if (s.startsWith('eqpos=')) curEqpos = parseInt(s.substring(6));
				else if (s.startsWith('r=')) {
					const rid = parseInt(s.substring(2));
					if (rid >= 0) {
						if (!curRes) curRes = [];
						if (!curRes.includes(rid)) curRes.push(rid);
					}
				}
			}

			pos = nul + 1;
		}
		emitEntity();
	}
	return entities;
}

/**
 * Encode entities back to (dynidx0.mul, dynamic0.mul) buffers.
 * One entity per block: dynidx0.mul gets one 12-byte entry per entity,
 * dynamic0.mul gets one [@=type\0, field\0, field\0, ...] block per entity.
 * The third i32 of each idx entry is unused by the parser; we write 0.
 */
function encodeDynamic(entities) {
	const blocks = [];
	let totalSize = 0;
	for (const e of entities) {
		const fields = e.fields || [];
		let size = 4; // "@=<type>\0"
		for (const f of fields) size += f.length + 1;
		blocks.push({ entity: e, offset: totalSize, length: size });
		totalSize += size;
	}

	const dat = new Uint8Array(totalSize);
	for (const b of blocks) {
		let p = b.offset;
		dat[p++] = 0x40;
		dat[p++] = 0x3d;
		dat[p++] = b.entity.type.charCodeAt(0) & 0xff;
		dat[p++] = 0;
		for (const f of b.entity.fields || []) {
			for (let i = 0; i < f.length; i++) dat[p++] = f.charCodeAt(i) & 0xff;
			dat[p++] = 0;
		}
	}

	const idx = new Uint8Array(blocks.length * 12);
	const idxView = new DataView(idx.buffer);
	for (let i = 0; i < blocks.length; i++) {
		idxView.setInt32(i * 12, blocks[i].offset, true);
		idxView.setInt32(i * 12 + 4, blocks[i].length, true);
		idxView.setInt32(i * 12 + 8, 0, true);
	}

	return { idxBuf: idx, datBuf: dat };
}

/** Build structured index: Map<typeMarker, [{typeId, label, entities:[...]}]> sorted by count */
function buildDynIndex(entities) {
	// Markers where type= is a body/creature graphic, not an item tile ID
	const BODY_TYPES = new Set(['S', 'G', 'N', 'M', 'P']);

	// First pass: group by (type, groupKey)
	// For eggs: group by each individual resource ID; for others: group by typeId
	const tmp = new Map(); // typeMarker -> Map<groupKey, entity[]>
	for (const e of entities) {
		if (e.x < 0 || e.y < 0) continue;
		if (e.cont !== undefined) continue; // skip contained entities (shown in inventory)
		if (!tmp.has(e.type)) tmp.set(e.type, new Map());
		const sub = tmp.get(e.type);
		if (e.type === 'E' && e.resKey) {
			// Each egg appears under every individual resource it references
			for (const rid of e.resKey.split(',')) {
				if (!sub.has(rid)) sub.set(rid, []);
				sub.get(rid).push(e);
			}
		} else {
			const key =
				e.type === 'E' ? 'none' : e.typeId >= 0 ? String(e.typeId) : '-1';
			if (!sub.has(key)) sub.set(key, []);
			sub.get(key).push(e);
		}
	}

	function subLabel(cat, key) {
		if (cat === 'E') {
			if (key === 'none') return 'no resources';
			return RES_NAMES[key] || 'res ' + key;
		}
		const tid = parseInt(key);
		if (isNaN(tid) || tid < 0)
			return (DYN_TYPE_LABELS[cat] || cat).replace(/s$/, '');
		if (BODY_TYPES.has(cat)) return BODY_NAMES[tid] || 'body ' + tid;
		return getDynItemLabel(tid);
	}

	// Build sorted structure
	const result = new Map();
	function buildCategory(cat, subMap) {
		const subs = [];
		for (const [key, ents] of subMap) {
			subs.push({ typeId: key, label: subLabel(cat, key), entities: ents });
		}
		subs.sort((a, b) => b.entities.length - a.entities.length);
		result.set(cat, subs);
	}
	for (const cat of DYN_TYPE_ORDER) {
		if (!tmp.has(cat)) continue;
		buildCategory(cat, tmp.get(cat));
	}
	for (const [cat, subMap] of tmp) {
		if (result.has(cat)) continue;
		buildCategory(cat, subMap);
	}
	return result;
}

function getDynItemLabel(typeId) {
	if (tileItemNames && tileItemNames.has(typeId))
		return tileItemNames.get(typeId);
	return 'item ' + typeId;
}

/** Count total entities in a category */
function dynCatTotal(cat) {
	const subs = dynByCategory.get(cat);
	if (!subs) return 0;
	return subs.reduce((s, sub) => s + sub.entities.length, 0);
}

/** Update status bar with dynamic entity world totals */
function updateDynStatus() {
	if (!dynByCategory) return;
	const parts = [];
	// Show totals for key categories in display order
	for (const cat of DYN_TYPE_ORDER) {
		const n = dynCatTotal(cat);
		if (n > 0) parts.push((DYN_TYPE_LABELS[cat] || cat) + ': ' + n);
	}
	document.getElementById('status-dynamic').textContent = parts.length
		? 'World: ' + parts.join(' | ')
		: '';
}

/** Get all sub-type keys for a category */
function dynCatSubKeys(cat) {
	const subs = dynByCategory.get(cat);
	if (!subs) return [];
	return subs.map((s) => cat + ':' + s.typeId);
}

/** Check if any entities are selected for display */
function dynHasSelection() {
	return dynCheckedCats.size > 0 || dynCheckedTypes.size > 0;
}

/** Check if an entity should be drawn */
function dynEntityVisible(e) {
	if (dynCheckedCats.has(e.type)) return true;
	if (e.type === 'E') {
		if (e.resKey) {
			for (const rid of e.resKey.split(',')) {
				if (dynCheckedTypes.has('E:' + rid)) return true;
			}
			return false;
		}
		return dynCheckedTypes.has('E:none');
	}
	return dynCheckedTypes.has(e.type + ':' + (e.typeId >= 0 ? e.typeId : -1));
}

/** Update the category checkbox to reflect sub-type state (tristate) */
function dynUpdateCatCheckbox(cat, chk) {
	const subKeys = dynCatSubKeys(cat);
	if (dynCheckedCats.has(cat)) {
		chk.checked = true;
		chk.indeterminate = false;
	} else {
		const checkedCount = subKeys.filter((k) => dynCheckedTypes.has(k)).length;
		if (checkedCount === 0) {
			chk.checked = false;
			chk.indeterminate = false;
		} else if (checkedCount === subKeys.length) {
			// All subs checked individually -> promote to full category
			for (const k of subKeys) dynCheckedTypes.delete(k);
			dynCheckedCats.add(cat);
			chk.checked = true;
			chk.indeterminate = false;
		} else {
			chk.checked = false;
			chk.indeterminate = true;
		}
	}
}

/** Toggle entire category on/off */
function dynToggleCategory(cat, forceOn) {
	const subKeys = dynCatSubKeys(cat);
	if (forceOn === undefined) forceOn = !dynCheckedCats.has(cat);
	if (forceOn) {
		dynCheckedCats.add(cat);
		for (const k of subKeys) dynCheckedTypes.delete(k);
	} else {
		dynCheckedCats.delete(cat);
		for (const k of subKeys) dynCheckedTypes.delete(k);
	}
}

/** Toggle a specific sub-type */
function dynToggleSubType(cat, typeId) {
	const key = cat + ':' + typeId;
	if (dynCheckedCats.has(cat)) {
		// Category was fully checked -> uncheck this one sub-type
		dynCheckedCats.delete(cat);
		const subKeys = dynCatSubKeys(cat);
		for (const k of subKeys) {
			if (k !== key) dynCheckedTypes.add(k);
		}
	} else if (dynCheckedTypes.has(key)) {
		dynCheckedTypes.delete(key);
	} else {
		dynCheckedTypes.add(key);
		// Check if all subs now checked -> promote
		const subKeys = dynCatSubKeys(cat);
		if (subKeys.every((k) => dynCheckedTypes.has(k))) {
			for (const k of subKeys) dynCheckedTypes.delete(k);
			dynCheckedCats.add(cat);
		}
	}
}

/** Is a specific sub-type checked? */
function dynSubTypeChecked(cat, typeId) {
	if (dynCheckedCats.has(cat)) return true;
	return dynCheckedTypes.has(cat + ':' + typeId);
}

function updateDynButton() {
	document
		.getElementById('btn-dynamic')
		.classList.toggle('active', dynHasSelection() || dynPanelOpen);
}

/* ---- Dynamic panel rendering ---- */

function buildDynPanel(filter) {
	const $list = document.getElementById('dyn-list');
	$list.innerHTML = '';
	if (!dynByCategory) {
		$list.innerHTML =
			'<div style="padding:8px;color:#666;font-size:12px">Loading...</div>';
		return;
	}

	const fl = (filter || '').toLowerCase();

	for (const cat of DYN_TYPE_ORDER) {
		if (!dynByCategory.has(cat)) continue;
		const subs = dynByCategory.get(cat);
		const catLabel = DYN_TYPE_LABELS[cat] || cat;
		const catColor = DYN_CAT_COLORS[cat] || '#888';
		// For eggs, entities appear in multiple sub-types; count unique
		let total;
		if (cat === 'E') {
			const seen = new Set();
			for (const sub of subs) for (const e of sub.entities) seen.add(e);
			total = seen.size;
		} else {
			total = subs.reduce((s, sub) => s + sub.entities.length, 0);
		}

		// If filter active, check if any sub matches
		let filteredSubs = subs;
		if (fl) {
			filteredSubs = subs.filter(
				(s) =>
					s.label.toLowerCase().includes(fl) ||
					String(s.typeId).includes(fl) ||
					catLabel.toLowerCase().includes(fl),
			);
			if (filteredSubs.length === 0) continue;
		}

		const catDiv = document.createElement('div');
		catDiv.className = 'dyn-cat';

		// Category header
		const hdr = document.createElement('div');
		hdr.className = 'dyn-cat-hdr';
		const arrow = document.createElement('span');
		arrow.className = 'dyn-arrow';
		const expanded = dynExpandedCats.has(cat) || fl;
		arrow.textContent = expanded ? '\u25BE' : '\u25B8';
		const chk = document.createElement('input');
		chk.type = 'checkbox';
		dynUpdateCatCheckbox(cat, chk);
		const dot = document.createElement('span');
		dot.className = 'dyn-dot';
		dot.style.background = catColor;
		const nameSpan = document.createElement('span');
		nameSpan.className = 'dyn-cat-name';
		nameSpan.textContent = catLabel;
		const countSpan = document.createElement('span');
		countSpan.className = 'dyn-cat-count';
		countSpan.textContent = total;
		hdr.append(arrow, chk, dot, nameSpan, countSpan);

		// Category checkbox click
		chk.addEventListener('click', (e) => {
			e.stopPropagation();
			dynToggleCategory(cat);
			updateDynButton();
			buildDynPanel(document.getElementById('dyn-search').value);
			requestRender();
		});

		// Header click -> expand/collapse
		hdr.addEventListener('click', (e) => {
			if (e.target === chk) return;
			if (dynExpandedCats.has(cat)) dynExpandedCats.delete(cat);
			else dynExpandedCats.add(cat);
			buildDynPanel(document.getElementById('dyn-search').value);
		});

		catDiv.appendChild(hdr);

		// Sub-items (if expanded or filtering)
		if (expanded) {
			const subDiv = document.createElement('div');
			subDiv.className = 'dyn-sub';
			let shown = 0;
			for (const sub of filteredSubs) {
				const row = document.createElement('div');
				row.className = 'dyn-sub-row';
				const subChk = document.createElement('input');
				subChk.type = 'checkbox';
				subChk.checked = dynSubTypeChecked(cat, sub.typeId);
				const subName = document.createElement('span');
				subName.className = 'dyn-sub-name';
				subName.textContent = sub.label;
				const subCount = document.createElement('span');
				subCount.className = 'dyn-sub-count';
				subCount.textContent = sub.entities.length;
				row.append(subChk, subName, subCount);

				subChk.addEventListener('click', (e) => {
					e.stopPropagation();
					dynToggleSubType(cat, sub.typeId);
					updateDynButton();
					buildDynPanel(document.getElementById('dyn-search').value);
					requestRender();
				});
				row.addEventListener('click', (e) => {
					if (e.target === subChk) return;
					dynToggleSubType(cat, sub.typeId);
					updateDynButton();
					buildDynPanel(document.getElementById('dyn-search').value);
					requestRender();
				});

				subDiv.appendChild(row);
				if (++shown >= 300) break;
			}
			catDiv.appendChild(subDiv);
		}

		$list.appendChild(catDiv);
	}
}

function toggleDynPanel() {
	const dynPanel = document.getElementById('dyn-panel');
	const showing = dynPanel.hidden;
	dynPanel.hidden = !showing;
	dynPanelOpen = showing;
	if (showing) {
		buildDynPanel('');
	} else {
		// Also hide dyn-props when dynamic is toggled off
		document.getElementById('dyn-props').hidden = true;
		selectedDynEntity = null;
		resetPanelHeights(document.getElementById('right-sidebar'));
	}
	document.getElementById('btn-dynamic').classList.toggle('active', showing);
	resetPanelHeights(document.getElementById('sidebar'));
	requestRender();
}

document
	.getElementById('btn-dynamic')
	.addEventListener('click', toggleDynPanel);
document.getElementById('dyn-panel-close').addEventListener('click', () => {
	dynPanelOpen = false;
	document.getElementById('dyn-panel').hidden = true;
	document.getElementById('btn-dynamic').classList.remove('active');
	resetPanelHeights(document.getElementById('sidebar'));
});
document.getElementById('dyn-search').addEventListener('input', (e) => {
	buildDynPanel(e.target.value);
});
document
	.getElementById('dyn-search')
	.addEventListener('keydown', (e) => e.stopPropagation());

/* ---- Drawing ---- */

function drawDynEntities(dpr) {
	if (!dynByCategory || !dynHasSelection()) return;

	const z = S.zoom * dpr;
	const cw = canvas.width / z,
		ch = canvas.height / z;
	const vx0 = S.viewX,
		vy0 = S.viewY;
	const vx1 = vx0 + cw,
		vy1 = vy0 + ch;
	const dotR = Math.max(1.5, 3 / S.zoom);
	const lw = Math.max(0.5, 1 / S.zoom);

	// Draw by category so each gets its own color
	for (const [cat, subs] of dynByCategory) {
		const fullCat = dynCheckedCats.has(cat);
		if (!fullCat) {
			// Check if any sub is selected
			const anyChecked = subs.some((s) =>
				dynCheckedTypes.has(cat + ':' + s.typeId),
			);
			if (!anyChecked) continue;
		}

		const color = DYN_CAT_COLORS[cat] || '#888';
		ctx.fillStyle = color;
		ctx.lineWidth = lw;

		const visible = [];
		const drawn = cat === 'E' ? new Set() : null; // dedup eggs (they appear in multiple sub-types)
		for (const sub of subs) {
			if (!fullCat && !dynCheckedTypes.has(cat + ':' + sub.typeId)) continue;
			for (const e of sub.entities) {
				if (drawn && drawn.has(e)) continue;
				if (drawn) drawn.add(e);
				if (e.x < vx0 - 1 || e.x > vx1 + 1 || e.y < vy0 - 1 || e.y > vy1 + 1)
					continue;
				ctx.beginPath();
				ctx.arc(e.x + 0.5, e.y + 0.5, dotR, 0, Math.PI * 2);
				ctx.fill();
				visible.push(e);
			}
		}

		// Crosshairs at high zoom
		if (S.zoom >= 2 && visible.length < 500) {
			const crossR = Math.max(1, 2 / S.zoom);
			ctx.strokeStyle = color + '80';
			ctx.lineWidth = 0.5 / S.zoom;
			for (const e of visible) {
				const cx = e.x + 0.5,
					cy = e.y + 0.5;
				ctx.beginPath();
				ctx.moveTo(cx - crossR * 2, cy);
				ctx.lineTo(cx + crossR * 2, cy);
				ctx.moveTo(cx, cy - crossR * 2);
				ctx.lineTo(cx, cy + crossR * 2);
				ctx.stroke();
			}
		}
	}

	// Highlight selected entity
	if (selectedDynEntity) {
		const e = selectedDynEntity;
		const cx = e.x + 0.5,
			cy = e.y + 0.5;
		const hlR = dotR * 2.5;
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = Math.max(1, 2 / S.zoom);
		ctx.beginPath();
		ctx.arc(cx, cy, hlR, 0, Math.PI * 2);
		ctx.stroke();
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = Math.max(0.5, 1 / S.zoom);
		ctx.beginPath();
		ctx.arc(cx, cy, hlR + Math.max(0.5, 1 / S.zoom), 0, Math.PI * 2);
		ctx.stroke();
	}
}

/* ---- Dynamic entity hit-test & properties ---- */

/** Find the nearest visible dynamic entity within radius of world coords */
function hitTestDynEntity(wx, wy) {
	if (!dynByCategory || !dynHasSelection()) return null;
	const radius = Math.max(3, 6 / S.zoom);
	let best = null,
		bestDist = radius * radius;
	for (const [cat, subs] of dynByCategory) {
		const fullCat = dynCheckedCats.has(cat);
		if (!fullCat) {
			const anyChecked = subs.some((s) =>
				dynCheckedTypes.has(cat + ':' + s.typeId),
			);
			if (!anyChecked) continue;
		}
		for (const sub of subs) {
			if (!fullCat && !dynCheckedTypes.has(cat + ':' + sub.typeId)) continue;
			for (const e of sub.entities) {
				const dx = e.x + 0.5 - wx,
					dy = e.y + 0.5 - wy;
				const d2 = dx * dx + dy * dy;
				if (d2 < bestDist) {
					bestDist = d2;
					best = e;
				}
			}
		}
	}
	return best;
}

function dynFieldLabel(key) {
	const labels = {
		type: 'Type',
		loc: 'Location',
		id: 'ID',
		cloc: 'Client Loc',
		stat: 'Status',
		r: 'Resource',
		name: 'Name',
		dir: 'Direction',
		amount: 'Amount',
		hue: 'Hue',
		layer: 'Layer',
		cont: 'Container',
		realid: 'Real ID',
		eqpos: 'Equip Slot',
	};
	return labels[key] || key;
}

/**
 * Build a <select> whose options are entries of `nameMap` (id -> label).
 * If `currentVal` doesn't match any key, append a synthetic option so the
 * user's value isn't silently snapped to the first entry; `resolveName`
 * (optional) supplies a label for that fallback option, else '(unknown)'.
 */
function makeMapSelect(nameMap, currentVal, resolveName) {
	const sel = document.createElement('select');
	const seen = new Set();
	const keys = Object.keys(nameMap)
		.map((k) => parseInt(k))
		.filter((k) => Number.isFinite(k))
		.sort((a, b) => a - b);
	for (const k of keys) {
		const opt = document.createElement('option');
		opt.value = String(k);
		opt.textContent = `${k} - ${nameMap[k]}`;
		sel.appendChild(opt);
		seen.add(String(k));
	}
	const cur = String(parseInt(currentVal));
	if (cur !== 'NaN' && !seen.has(cur)) {
		const opt = document.createElement('option');
		opt.value = cur;
		const name = resolveName ? resolveName(parseInt(currentVal)) : null;
		opt.textContent = `${cur} - ${name || '(unknown)'}`;
		sel.appendChild(opt);
	}
	sel.value = cur !== 'NaN' ? cur : '0';
	return sel;
}

/**
 * Map of typeId -> name for the `type=` dropdown of a given entity
 * category. Creatures (S/G/N/M/P) use the fixed BODY_NAMES table; tile
 * categories (D/C/W/B/Z) derive a map from the typeIds actually present
 * on entities of that category in the loaded world. Cached per category,
 * invalidated whenever dynamic data reloads.
 */
let _typeMapCache = {};
function getTypeMap(cat) {
	if (_typeMapCache[cat]) return _typeMapCache[cat];
	let map;
	if ('SGNMP'.includes(cat)) {
		map = BODY_NAMES;
	} else {
		map = {};
		if (dynEntities && tileItemNames) {
			const used = new Set();
			for (const e of dynEntities) {
				if (e.type === cat && e.typeId >= 0) used.add(e.typeId);
			}
			for (const id of used) {
				if (tileItemNames.has(id)) map[id] = tileItemNames.get(id);
			}
		}
	}
	_typeMapCache[cat] = map;
	return map;
}

/* ===================================================================
 *  TILE PICKER  (searchable full-catalog dialog)
 * =================================================================== */
const TILE_PICKER_LIMIT = 400;
let _tilePickerApply = null; // (id) => void, set while the modal is open

function populateTileList(filter) {
	const list = document.getElementById('tile-list');
	const info = document.getElementById('tile-picker-info');
	list.innerHTML = '';
	if (!tileItemNames) {
		info.textContent = 'tiledata.mul not loaded';
		return;
	}
	const fl = filter.trim().toLowerCase();
	let matched = 0;
	let shown = 0;
	for (const [id, name] of tileItemNames) {
		if (fl && !name.toLowerCase().includes(fl) && !String(id).includes(fl))
			continue;
		matched++;
		if (shown < TILE_PICKER_LIMIT) {
			const opt = document.createElement('option');
			opt.value = String(id);
			opt.textContent = `${id} - ${name}`;
			list.appendChild(opt);
			shown++;
		}
	}
	if (list.options.length > 0) list.selectedIndex = 0;
	info.textContent =
		matched > shown
			? `${shown} of ${matched} matches shown - refine the filter`
			: `${matched} match${matched === 1 ? '' : 'es'}`;
}

function populateTileLayerSelect() {
	const sel = document.getElementById('tile-layer');
	if (sel.options.length > 0) return;
	const keys = Object.keys(LAYER_NAMES)
		.map((k) => parseInt(k))
		.filter((k) => Number.isFinite(k) && k > 0)
		.sort((a, b) => a - b);
	for (const k of keys) {
		const opt = document.createElement('option');
		opt.value = String(k);
		opt.textContent = `${k} - ${LAYER_NAMES[k]}`;
		sel.appendChild(opt);
	}
}

function openTilePicker(applyFn, currentId, opts) {
	_tilePickerApply = applyFn;
	const withCategory = !!(opts && opts.withCategory);
	const withLayer = !!(opts && opts.withLayer);
	document.getElementById('tile-cat-row').hidden = !withCategory;
	document.getElementById('tile-layer-row').hidden = !withLayer;
	if (withCategory)
		document.getElementById('tile-cat').value = withLayer ? 'W' : 'D';
	if (withLayer) {
		populateTileLayerSelect();
		document.getElementById('tile-layer').value = '1';
	}
	const search = document.getElementById('tile-search');
	const startName =
		tileItemNames && tileItemNames.has(currentId)
			? tileItemNames.get(currentId)
			: '';
	search.value = startName;
	populateTileList(search.value);
	document.getElementById('tile-picker').hidden = false;
	search.focus();
	search.select();
}

function closeTilePicker() {
	document.getElementById('tile-picker').hidden = true;
	_tilePickerApply = null;
}

function confirmTilePicker() {
	const list = document.getElementById('tile-list');
	if (list.value && _tilePickerApply) {
		const cat = document.getElementById('tile-cat').value;
		const layerRow = document.getElementById('tile-layer-row');
		const eqpos = layerRow.hidden
			? undefined
			: parseInt(document.getElementById('tile-layer').value);
		_tilePickerApply(parseInt(list.value), cat, eqpos);
	}
	closeTilePicker();
}

document.getElementById('tile-search').addEventListener('input', (e) => {
	populateTileList(e.target.value);
});
document.getElementById('tile-search').addEventListener('keydown', (e) => {
	e.stopPropagation();
	if (e.key === 'Enter') confirmTilePicker();
});
document.getElementById('tile-list').addEventListener('dblclick', () => {
	confirmTilePicker();
});
document
	.getElementById('tile-picker-ok')
	.addEventListener('click', confirmTilePicker);
document
	.getElementById('tile-picker-cancel')
	.addEventListener('click', closeTilePicker);
document.getElementById('tile-picker').addEventListener('click', (e) => {
	if (e.target === document.getElementById('tile-picker')) closeTilePicker();
});
document.getElementById('tile-picker').addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		closeTilePicker();
		e.stopPropagation();
	}
});

function showDynProps(entity) {
	selectedDynEntity = entity;
	const panel = document.getElementById('dyn-props');
	const content = document.getElementById('dyn-props-content');
	content.innerHTML = '';

	if (!entity) {
		panel.hidden = true;
		resetPanelHeights(document.getElementById('right-sidebar'));
		requestRender();
		return;
	}

	const wasHidden = panel.hidden;
	panel.hidden = false;
	if (wasHidden) resetPanelHeights(document.getElementById('right-sidebar'));

	// Type header with descriptive subtitle
	const BODY_TYPES_SET = new Set(['S', 'G', 'N', 'M', 'P']);
	const typeLabel = DYN_TYPE_LABELS[entity.type]
		? DYN_TYPE_LABELS[entity.type].replace(/s$/, '')
		: entity.type;
	let subtitle = '';
	if (BODY_TYPES_SET.has(entity.type) && entity.typeId >= 0) {
		subtitle = BODY_NAMES[entity.typeId] || 'body ' + entity.typeId;
	} else if ('DCW'.includes(entity.type) && entity.typeId >= 0) {
		subtitle =
			tileItemNames && tileItemNames.has(entity.typeId)
				? tileItemNames.get(entity.typeId)
				: 'item ' + entity.typeId;
	} else if (entity.type === 'E' && entity.resKey) {
		subtitle = entity.resKey
			.split(',')
			.map((r) => RES_NAMES[r] || 'res ' + r)
			.join(', ');
	}
	const hdr = document.createElement('div');
	hdr.className = 'dyn-prop-type';
	const color = DYN_CAT_COLORS[entity.type] || '#888';
	hdr.innerHTML =
		`<span style="color:${color}">\u25CF</span> ${typeLabel}` +
		(subtitle ? ` <span style="color:#888">\u2014 ${subtitle}</span>` : '');
	content.appendChild(hdr);

	// Back button for contained entities
	if (entity.cont !== undefined && dynById && dynById.has(entity.cont)) {
		const parent = dynById.get(entity.cont);
		const backRow = document.createElement('div');
		backRow.className = 'prop-row dyn-inv-back';
		const backBtn = document.createElement('button');
		backBtn.className = 'dyn-inv-back-btn';
		const parentLabel = LAYER_NAMES[entity.eqpos] || '';
		backBtn.textContent =
			'\u2190 Back to ' +
			(DYN_TYPE_LABELS[parent.type] || parent.type).replace(/s$/, '');
		backBtn.addEventListener('click', () => showDynProps(parent));
		backRow.appendChild(backBtn);
		content.appendChild(backRow);
	}

	// Drag-and-drop reorder state
	let dragIdx = -1;

	// Editable fields from the raw data
	for (let fi = 0; fi < entity.fields.length; fi++) {
		const field = entity.fields[fi];
		const eq = field.indexOf('=');
		if (eq < 0) continue;
		const key = field.substring(0, eq);
		const val = field.substring(eq + 1);
		const row = document.createElement('div');
		row.className = 'prop-row dyn-prop-field';
		row.dataset.fi = fi;
		row.addEventListener('dragover', (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			content
				.querySelectorAll('.drag-over')
				.forEach((el) => el.classList.remove('drag-over'));
			if (parseInt(row.dataset.fi) !== dragIdx) row.classList.add('drag-over');
		});
		row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
		row.addEventListener('drop', (e) => {
			e.preventDefault();
			row.classList.remove('drag-over');
			const toIdx = parseInt(row.dataset.fi);
			if (dragIdx >= 0 && dragIdx !== toIdx) {
				pushDynMutateUndo(entity);
				const moved = entity.fields.splice(dragIdx, 1)[0];
				entity.fields.splice(toIdx > dragIdx ? toIdx - 1 : toIdx, 0, moved);
				showDynProps(entity);
				markDynDirty();
			}
		});

		const lbl = document.createElement('label');
		lbl.textContent = dynFieldLabel(key);
		lbl.draggable = true;
		lbl.style.cursor = 'grab';
		lbl.addEventListener('dragstart', (e) => {
			dragIdx = fi;
			row.classList.add('dragging');
			e.dataTransfer.effectAllowed = 'move';
		});
		lbl.addEventListener('dragend', () => {
			row.classList.remove('dragging');
			dragIdx = -1;
			content
				.querySelectorAll('.drag-over')
				.forEach((el) => el.classList.remove('drag-over'));
		});
		const del = document.createElement('button');
		del.className = 'dyn-prop-del';
		del.textContent = '\u00D7';
		del.title = 'Delete field';
		del.addEventListener(
			'click',
			((idx) => () => {
				pushDynMutateUndo(entity);
				entity.fields.splice(idx, 1);
				dynRederiveEntity(entity);
				showDynProps(entity);
				markDynDirty();
			})(fi),
		);

		// eqpos= -> select from LAYER_NAMES
		if (key === 'eqpos') {
			const sel = makeMapSelect(LAYER_NAMES, val);
			sel.addEventListener('change', () =>
				dynFieldChanged(entity, fi, sel.value),
			);
			row.append(lbl, sel, del);
			content.appendChild(row);
			continue;
		}

		// r= for E (egg) entities -> select for first token + input for rest
		if (key === 'r' && entity.type === 'E') {
			const tokens = val.split(/\s+/);
			const sel = makeMapSelect(RES_NAMES, tokens[0]);
			const restInp = document.createElement('input');
			restInp.type = 'text';
			restInp.value = tokens.slice(1).join(' ');
			restInp.className = 'dyn-prop-rest';
			restInp.addEventListener('keydown', (e) => e.stopPropagation());
			const commit = () => {
				const rest = restInp.value.trim();
				dynFieldChanged(entity, fi, rest ? sel.value + ' ' + rest : sel.value);
			};
			sel.addEventListener('change', commit);
			restInp.addEventListener('change', commit);
			row.append(lbl, sel, restInp, del);
			content.appendChild(row);
			continue;
		}

		// type= -> <select> from the category's type map (BODY_NAMES for
		// creatures; per-category tile-id map for D/C/W/B/Z). Tile
		// categories also get a browse button into the full tile catalog.
		// Falls through to the typed input if the category has no map.
		if (key === 'type') {
			const map = getTypeMap(entity.type);
			if (map && Object.keys(map).length > 0) {
				const isTileCat = 'DCWBZ'.includes(entity.type);
				const sel = makeMapSelect(
					map,
					val,
					isTileCat && tileItemNames
						? (id) => tileItemNames.get(id)
						: undefined,
				);
				sel.addEventListener('change', () =>
					dynFieldChanged(entity, fi, sel.value),
				);
				if (isTileCat) {
					const browse = document.createElement('button');
					browse.type = 'button';
					browse.className = 'dyn-prop-browse';
					browse.textContent = '…';
					browse.title = 'Browse full tile catalog';
					browse.addEventListener('click', () => {
						openTilePicker(
							(id) => dynFieldChanged(entity, fi, String(id)),
							parseInt(val),
						);
					});
					row.append(lbl, sel, browse, del);
				} else {
					row.append(lbl, sel, del);
				}
				content.appendChild(row);
				continue;
			}
		}

		// Plain text input (default)
		const inp = document.createElement('input');
		inp.type = 'text';
		inp.value = val;
		inp.dataset.fieldIdx = fi;
		inp.addEventListener('keydown', (e) => e.stopPropagation());
		inp.addEventListener(
			'change',
			((idx) => () => {
				dynFieldChanged(entity, idx, inp.value);
			})(fi),
		);

		// Show clickable link for cont= fields
		if (key === 'cont' && dynById && dynById.has(parseInt(val))) {
			const parent = dynById.get(parseInt(val));
			const link = document.createElement('span');
			link.className = 'dyn-inv-item';
			link.style.cssText = 'font-size:10px;flex-shrink:0;padding-left:4px';
			const pLabel = (DYN_TYPE_LABELS[parent.type] || parent.type).replace(
				/s$/,
				'',
			);
			link.textContent = pLabel;
			link.addEventListener('click', () => showDynProps(parent));
			row.append(lbl, inp, link, del);
			content.appendChild(row);
			continue;
		}

		row.append(lbl, inp, del);
		content.appendChild(row);
	}

	// Add new field row
	const addRow = document.createElement('div');
	addRow.className = 'prop-row dyn-prop-add-row';
	const addInp = document.createElement('input');
	addInp.type = 'text';
	addInp.placeholder = 'key=value';
	addInp.addEventListener('keydown', (e) => {
		e.stopPropagation();
		if (e.key === 'Enter' && addInp.value.includes('=')) {
			pushDynMutateUndo(entity);
			entity.fields.push(addInp.value);
			dynRederiveEntity(entity);
			showDynProps(entity);
			markDynDirty();
		}
	});
	const addBtn = document.createElement('button');
	addBtn.className = 'dyn-prop-add';
	addBtn.textContent = '+';
	addBtn.title = 'Add field';
	addBtn.addEventListener('click', () => {
		if (addInp.value.includes('=')) {
			pushDynMutateUndo(entity);
			entity.fields.push(addInp.value);
			dynRederiveEntity(entity);
			showDynProps(entity);
			markDynDirty();
		}
	});
	addRow.append(addInp, addBtn);
	content.appendChild(addRow);

	// Inventory section: equipped items + container contents. Renders
	// for any entity with children, always for a container (C) so the
	// Add Item button is reachable, and always for a creature so the
	// Equipment Add button is reachable.
	const isContainerEntity = entity.type === 'C';
	const isCreatureEntity = 'SGNMP'.includes(entity.type);
	if (dynChildren && entity.id >= 0) {
		const kids = dynChildren.get(entity.id) || [];
		// Children with eqpos > 0 are equipped (worn items, the creature's
		// backpack/bank-box). The rest are loose container contents.
		const equipment = kids.filter(
			(ch) => ch.eqpos !== undefined && ch.eqpos > 0,
		);
		equipment.sort((a, b) => (a.eqpos || 0) - (b.eqpos || 0));
		const contents = kids.filter(
			(ch) => ch.eqpos === undefined || ch.eqpos === 0,
		);

		const itemRow = (ch, slotLabel) => {
			const row = document.createElement('div');
			row.className = 'prop-row dyn-inv-row';
			const lbl = document.createElement('label');
			lbl.textContent = slotLabel;
			const span = document.createElement('span');
			span.className = 'dyn-inv-item';
			let name =
				tileItemNames && tileItemNames.has(ch.typeId)
					? tileItemNames.get(ch.typeId)
					: ch.typeId >= 0
						? 'item ' + ch.typeId
						: '(no type)';
			if (ch.type === 'C') {
				const kc = (dynChildren.get(ch.id) || []).length;
				name += ` (${kc})`;
			}
			span.textContent = name;
			const amt = ch.fields.find((f) => f.startsWith('amount='));
			if (amt) span.textContent += ' x' + amt.substring(7);
			span.addEventListener('click', () => showDynProps(ch));
			row.append(lbl, span, makeInvDelButton(ch));
			content.appendChild(row);
		};

		if (equipment.length > 0 || isCreatureEntity) {
			const sep = document.createElement('div');
			sep.className = 'dyn-prop-sep';
			content.appendChild(sep);
			const eqHdr = document.createElement('div');
			eqHdr.className = 'dyn-prop-type dyn-inv-hdr';
			const eqTitle = document.createElement('span');
			eqTitle.textContent = 'Equipment';
			eqHdr.appendChild(eqTitle);
			if (isCreatureEntity) {
				const addBtn = document.createElement('button');
				addBtn.type = 'button';
				addBtn.className = 'dyn-inv-add';
				addBtn.textContent = '+ Add Worn';
				addBtn.addEventListener('click', () => {
					openTilePicker(
						(tileId, cat, eqpos) =>
							dynAddContainedItem(entity, cat, tileId, eqpos),
						-1,
						{ withCategory: true, withLayer: true },
					);
				});
				eqHdr.appendChild(addBtn);
			}
			content.appendChild(eqHdr);
			for (const ch of equipment)
				itemRow(ch, LAYER_NAMES[ch.eqpos] || 'layer ' + ch.eqpos);
		}

		if (contents.length > 0 || isContainerEntity) {
			const sep = document.createElement('div');
			sep.className = 'dyn-prop-sep';
			content.appendChild(sep);
			const cHdr = document.createElement('div');
			cHdr.className = 'dyn-prop-type dyn-inv-hdr';
			const cTitle = document.createElement('span');
			cTitle.textContent = `Contents (${contents.length})`;
			cHdr.appendChild(cTitle);
			if (isContainerEntity) {
				const addBtn = document.createElement('button');
				addBtn.type = 'button';
				addBtn.className = 'dyn-inv-add';
				addBtn.textContent = '+ Add Item';
				addBtn.addEventListener('click', () => {
					openTilePicker(
						(tileId, cat) => dynAddContainedItem(entity, cat, tileId),
						-1,
						{ withCategory: true },
					);
				});
				cHdr.appendChild(addBtn);
			}
			content.appendChild(cHdr);
			for (const ch of contents) itemRow(ch, ch.type);
		}
	}

	requestRender();
}

/** Re-derive parsed entity values (loc, type, id, resKey) from fields */
function dynRederiveEntity(entity) {
	entity.typeId = -1;
	entity.id = -1;
	const rids = [];
	for (const f of entity.fields) {
		if (f.startsWith('loc=')) {
			const parts = f.substring(4).split(' ');
			if (parts.length >= 3) {
				entity.x = parseInt(parts[0]) || 0;
				entity.y = parseInt(parts[1]) || 0;
				entity.z = parseInt(parts[2]) || 0;
			}
		} else if (f.startsWith('type=')) {
			entity.typeId = parseInt(f.substring(5)) || -1;
		} else if (f.startsWith('id=')) {
			entity.id = parseInt(f.substring(3)) || -1;
		} else if (f.startsWith('cont=')) {
			const cv = parseInt(f.substring(5));
			entity.cont = cv >= 0 ? cv : undefined;
		} else if (f.startsWith('eqpos=')) {
			const ev = parseInt(f.substring(6));
			entity.eqpos = ev >= 0 ? ev : undefined;
		} else if (f.startsWith('r=')) {
			const rid = parseInt(f.substring(2));
			if (rid >= 0 && !rids.includes(rid)) rids.push(rid);
		}
	}
	if (entity.type === 'E') {
		rids.sort((a, b) => a - b);
		entity.resKey = rids.length > 0 ? rids.join(',') : undefined;
	}
}

/** Update entity data when a field is edited, then refresh the panel */
function dynFieldChanged(entity, fieldIdx, newVal) {
	const old = entity.fields[fieldIdx];
	const eq = old.indexOf('=');
	if (eq < 0) return;
	const key = old.substring(0, eq);
	pushDynMutateUndo(entity);
	entity.fields[fieldIdx] = key + '=' + newVal;
	dynRederiveEntity(entity);
	showDynProps(entity);
	markDynDirty();
	if (isEntityDiffOpen()) refreshEntityDiff();
}

document.getElementById('dyn-props-close').addEventListener('click', () => {
	showDynProps(null);
});

function loadDynamic() {
	const tiledataP = fetch(TILEDATA_PATH)
		.then((r) => {
			if (!r.ok) throw new Error(r.status);
			return r.arrayBuffer();
		})
		.then((buf) => {
			const parsed = parseTiledata(buf);
			tileItemNames = parsed.names;
			tileItemFlags = parsed.flags;
		})
		.catch((err) => console.warn('Tiledata not loaded:', err.message));

	const idxP = fetch(DYN_PATH + 'dynidx0.mul').then((r) => {
		if (!r.ok) throw new Error(r.status);
		return r.arrayBuffer();
	});
	const datP = fetch(DYN_PATH + 'dynamic0.mul').then((r) => {
		if (!r.ok) throw new Error(r.status);
		return r.arrayBuffer();
	});

	Promise.all([tiledataP, idxP, datP])
		.then(([_, idxBuf, datBuf]) => applyDynamicData(idxBuf, datBuf))
		.catch((err) => console.warn('Dynamic files not loaded:', err.message));
}

function applyDynamicData(idxBuf, datBuf) {
	dynEntities = parseDynamic(idxBuf, datBuf);
	window.dynEntities = dynEntities;
	_typeMapCache = {}; // invalidate derived caches
	dynById = new Map();
	dynChildren = new Map();
	for (const e of dynEntities) {
		if (e.id >= 0) dynById.set(e.id, e);
	}
	for (const e of dynEntities) {
		if (e.cont !== undefined) {
			if (!dynChildren.has(e.cont)) dynChildren.set(e.cont, []);
			dynChildren.get(e.cont).push(e);
		}
	}
	dynByCategory = buildDynIndex(dynEntities);
	dynBaseline = dynEntities.map((e) => ({
		...e,
		fields: e.fields ? [...e.fields] : [],
	}));
	document.getElementById('btn-entity-diff').disabled = false;
	const contained = dynEntities.filter((e) => e.cont !== undefined).length;
	console.log(
		`Dynamic: ${dynEntities.length} entities (${contained} contained), ${dynByCategory.size} categories`,
	);
	updateDynStatus();
	if (dynPanelOpen) buildDynPanel('');
	if (isEntityDiffOpen()) refreshEntityDiff();
	S.dynDirty = false;
	updateTitle();
	updateSaveButton();
}

function loadDynamicFromFiles(idxFile, datFile) {
	Promise.all([idxFile.arrayBuffer(), datFile.arrayBuffer()])
		.then(([idxBuf, datBuf]) => applyDynamicData(idxBuf, datBuf))
		.catch((err) => alert('Failed to load dynamic files: ' + err.message));
}

/* ===================================================================
 *  SIDEBAR PANEL RESIZE
 * =================================================================== */
(function initPanelResize() {
	const sidebars = [
		document.getElementById('sidebar'),
		document.getElementById('right-sidebar'),
	];
	let resizeTarget = null,
		startY = 0,
		startH = 0;

	function prevVisiblePanel(panel) {
		let el = panel.previousElementSibling;
		while (el && el.hidden) el = el.previousElementSibling;
		return el && el.classList.contains('sidebar-panel') ? el : null;
	}

	for (const sidebar of sidebars) {
		sidebar.addEventListener('mouseover', (e) => {
			const hdr = e.target.closest('.panel-hdr');
			if (!hdr) return;
			const above = prevVisiblePanel(hdr.parentElement);
			hdr.style.cursor = above ? 'ns-resize' : '';
		});

		sidebar.addEventListener('mousedown', (e) => {
			const hdr = e.target.closest('.panel-hdr');
			if (!hdr || e.target.tagName === 'BUTTON') return;
			const panel = hdr.parentElement;
			const above = prevVisiblePanel(panel);
			if (!above) return; // topmost panel — not resizable
			resizeTarget = above;
			startY = e.clientY;
			startH = above.getBoundingClientRect().height;
			e.preventDefault();
		});
	}

	window.addEventListener('mousemove', (e) => {
		if (!resizeTarget) return;
		const delta = e.clientY - startY;
		const newH = Math.max(30, startH + delta);
		resizeTarget.style.flex = 'none';
		resizeTarget.style.height = newH + 'px';
	});

	window.addEventListener('mouseup', () => {
		resizeTarget = null;
	});
})();

/* ===================================================================
 *  INITIALIZATION
 * =================================================================== */
function init() {
	// load map image
	const img = new Image();
	img.onload = () => {
		S.mapImage = img;
		S.mapLoaded = true;
		S.mapScale = img.naturalWidth / MAP_W;
		fitToView();
	};
	img.onerror = () => {
		document.getElementById('status-regions').textContent =
			'Error: map.png not found';
	};
	img.src = 'map.png';

	loadBank();
	loadHeightmap();
	loadDefaultRegions();
	loadDynamic();
	updateTitle();
	requestRender();
}

init();

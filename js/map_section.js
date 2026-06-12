    // ═══════════════════════════════════════════════════
    //  MAP & QUESTS (OpenSeadragon via local CORS proxy)
    // ═══════════════════════════════════════════════════

    // DZI from b42map.com served through our local proxy to avoid CORS
    const MAP_DZI_URL = '/map-proxy/base/layer0.dzi';

    function initMap() {
        if (pzMap) return;

        pzMap = OpenSeadragon({
            id: 'pz-map',
            prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1.1/build/openseadragon/images/',
            tileSources: MAP_DZI_URL,
            showNavigationControl: true,
            showNavigator: true,
            navigatorPosition: 'BOTTOM_RIGHT',
            navigatorSizeRatio: 0.15,
            navigatorBackground: '#0a0f0d',
            showZoomControl: true,
            showHomeControl: true,
            showFullPageControl: false,
            showRotationControl: false,
            minZoomImageRatio: 0.5,
            maxZoomPixelRatio: 4,
            homeFillsViewer: true,
            constrainDuringPan: true,
            visibilityRatio: 0.5,
            gestureSettingsMouse: {
                clickToZoom: false,
                dblClickToZoom: true,
                scrollToZoom: true,
            },
            gestureSettingsTouch: {
                pinchToZoom: true,
                dblClickToZoom: true,
            },
            immediateRender: true,
            imageLoaderLimit: 5,
            maxImageCacheCount: 500,
            background: '#0a0f0c',
        });

        // Coordinate tracking
        const tracker = new OpenSeadragon.MouseTracker({
            element: pzMap.canvas,
            moveHandler: function(e) {
                if (!pzMap.viewport) return;
                var vp = pzMap.viewport.pointFromPixel(e.position);
                var ip = pzMap.viewport.viewportToImageCoordinates(vp);
                var coordsEl = document.getElementById('map-coords');
                if (coordsEl) coordsEl.textContent = 'X:' + Math.round(ip.x) + ' Y:' + Math.round(ip.y);
            }
        });

        // Click to create quest
        pzMap.addHandler('canvas-click', function(e) {
            if (e.quick) {
                var vp = pzMap.viewport.pointFromPixel(e.position);
                var ip = pzMap.viewport.viewportToImageCoordinates(vp);
                openQuestModal(ip.x, ip.y, null, 'X:' + Math.round(ip.x) + ' Y:' + Math.round(ip.y));
                e.preventDefaultAction = true;
            }
        });

        // Update quest overlays on viewport change
        pzMap.addHandler('animation', updateQuestOverlays);
        pzMap.addHandler('animation-finish', updateQuestOverlays);
        pzMap.addHandler('open', function() {
            setTimeout(updateQuestOverlays, 500);
        });
    }

    // ── Quest Overlays (pinned to image coordinates) ──
    function updateQuestOverlays() {
        if (!pzMap || !pzMap.viewport) return;
        var overlayEl = document.getElementById('quest-overlays');
        if (!overlayEl) return;

        state.quests.forEach(function(quest) {
            if (!quest.imgX || !quest.imgY) return;

            var el = questMarkers[quest.id];
            if (!el) {
                el = createQuestOverlayElement(quest);
                overlayEl.appendChild(el);
                questMarkers[quest.id] = el;
            }

            // Convert image coords -> viewport -> viewer pixel
            var viewportPoint = pzMap.viewport.imageToViewportCoordinates(
                new OpenSeadragon.Point(quest.imgX, quest.imgY)
            );
            var pixelPoint = pzMap.viewport.viewportToViewerElementCoordinates(viewportPoint);

            el.style.left = (pixelPoint.x - 14) + 'px';
            el.style.top = (pixelPoint.y - 32) + 'px';
            el.style.display = 'block';
        });
    }

    function createQuestOverlayElement(quest) {
        var colors = { easy: '#4ade80', medium: '#f59e0b', hard: '#ef4444', hardcore: '#a78bfa' };
        var color = colors[quest.difficulty] || '#4ade80';
        var diffLabels = { easy: 'F\u00e1cil', medium: 'M\u00e9dio', hard: 'Dif\u00edcil', hardcore: 'Hardcore' };
        var isCompleted = quest.status === 'completed';

        var el = document.createElement('div');
        el.className = 'quest-pin';
        el.dataset.questId = quest.id;
        el.style.cssText = 'position:absolute;z-index:1000;cursor:pointer;transition:transform 0.15s ease;';

        el.innerHTML = '<div style="width:28px;height:28px;background:' + color +
            ';border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);' +
            'box-shadow:0 0 12px ' + color + '80,0 2px 8px rgba(0,0,0,0.5);' +
            'display:flex;align-items:center;justify-content:center;' +
            (isCompleted ? 'opacity:0.6;' : '') +
            '"><span style="transform:rotate(45deg);font-size:12px;">' +
            (isCompleted ? '\u2705' : '\u{1F4CC}') + '</span></div>';

        // Tooltip
        var tooltip = document.createElement('div');
        tooltip.className = 'quest-pin-tooltip';
        tooltip.style.cssText = 'position:absolute;bottom:36px;left:50%;transform:translateX(-50%);' +
            'background:rgba(13,20,16,0.95);border:1px solid ' + color + '44;border-radius:8px;' +
            'padding:8px 12px;font-size:12px;color:#e8f0ec;white-space:nowrap;pointer-events:none;' +
            'display:none;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.4);z-index:1001;';
        tooltip.innerHTML = '<strong>' + quest.name + '</strong><br>' +
            '<span style="color:#8fa89a">' + (diffLabels[quest.difficulty] || '') + '</span>' +
            (quest.reward ? ' \u00b7 \u{1F3C6} ' + quest.reward : '') +
            (quest.assignedTo ? '<br><span style="color:' + color + '">\u{1F464} ' + quest.assignedTo + '</span>' : '');
        el.appendChild(tooltip);

        el.addEventListener('mouseenter', function() {
            tooltip.style.display = 'block';
            el.style.transform = 'scale(1.2)';
        });
        el.addEventListener('mouseleave', function() {
            tooltip.style.display = 'none';
            el.style.transform = 'scale(1)';
        });
        el.addEventListener('click', function(ev) {
            ev.stopPropagation();
            openQuestModal(quest.imgX, quest.imgY, quest, quest.location);
        });

        return el;
    }

    function addQuestMarker(quest) {
        if (!quest.imgX || !quest.imgY) return;
        removeQuestMarker(quest.id);
        if (pzMap && pzMap.viewport) {
            var el = createQuestOverlayElement(quest);
            var overlayEl = document.getElementById('quest-overlays');
            if (overlayEl) overlayEl.appendChild(el);
            questMarkers[quest.id] = el;
            updateQuestOverlays();
        }
    }

    function removeQuestMarker(questId) {
        if (questMarkers[questId]) {
            questMarkers[questId].remove();
            delete questMarkers[questId];
        }
    }

    // ── Quest Modal ──
    function openQuestModal(imgX, imgY, editQuest, locationStr) {
        var modal = document.getElementById('quest-modal');
        var titleEl = document.getElementById('quest-modal-title');
        updateQuestAssignDropdown();

        if (editQuest) {
            titleEl.textContent = 'Editar Quest';
            document.getElementById('quest-name').value = editQuest.name || '';
            document.getElementById('quest-description').value = editQuest.description || '';
            document.getElementById('quest-difficulty').value = editQuest.difficulty || 'easy';
            document.getElementById('quest-reward').value = editQuest.reward || '';
            document.getElementById('quest-location').value = editQuest.location || '';
            document.getElementById('quest-assign').value = editQuest.assignedTo || '';
            document.getElementById('quest-lat').value = editQuest.imgX || '';
            document.getElementById('quest-lng').value = editQuest.imgY || '';
            document.getElementById('quest-edit-id').value = editQuest.id;
        } else {
            titleEl.textContent = 'Nova Quest';
            document.getElementById('quest-name').value = '';
            document.getElementById('quest-description').value = '';
            document.getElementById('quest-difficulty').value = 'easy';
            document.getElementById('quest-reward').value = '';
            document.getElementById('quest-location').value = locationStr || '';
            document.getElementById('quest-assign').value = '';
            document.getElementById('quest-lat').value = imgX || '';
            document.getElementById('quest-lng').value = imgY || '';
            document.getElementById('quest-edit-id').value = '';
        }
        modal.classList.add('visible');
    }

    function updateQuestAssignDropdown() {
        var select = document.getElementById('quest-assign');
        var currentVal = select.value;
        select.innerHTML = '<option value="">\u2014 Todos os jogadores \u2014</option>';
        state.players.filter(function(p) { return p.name; }).forEach(function(p) {
            select.innerHTML += '<option value="' + p.name + '">' + p.name + '</option>';
        });
        state.users.forEach(function(u) {
            if (!state.players.find(function(p) { return p.name === u.username; })) {
                select.innerHTML += '<option value="' + u.username + '">' + u.username + ' (conta)</option>';
            }
        });
        select.value = currentVal;
    }

    document.getElementById('btn-add-quest').addEventListener('click', function() { openQuestModal(); });
    document.getElementById('btn-add-quest-header').addEventListener('click', function() { openQuestModal(); });
    document.getElementById('btn-close-quest-modal').addEventListener('click', function() { document.getElementById('quest-modal').classList.remove('visible'); });
    document.getElementById('btn-cancel-quest').addEventListener('click', function() { document.getElementById('quest-modal').classList.remove('visible'); });

    document.getElementById('btn-confirm-quest').addEventListener('click', function() {
        var name = document.getElementById('quest-name').value.trim();
        if (!name) { showToast('D\u00ea um nome \u00e0 quest', 'error'); return; }

        var editId = document.getElementById('quest-edit-id').value;
        var questData = {
            name: name,
            description: document.getElementById('quest-description').value.trim(),
            difficulty: document.getElementById('quest-difficulty').value,
            reward: document.getElementById('quest-reward').value.trim(),
            location: document.getElementById('quest-location').value.trim(),
            imgX: parseFloat(document.getElementById('quest-lat').value) || null,
            imgY: parseFloat(document.getElementById('quest-lng').value) || null,
            assignedTo: document.getElementById('quest-assign').value || null,
        };

        if (editId) {
            var quest = state.quests.find(function(q) { return q.id === editId; });
            if (quest) { Object.assign(quest, questData); removeQuestMarker(editId); addQuestMarker(quest); }
            showToast('Quest atualizada! \u{1F4CC}');
        } else {
            var quest = { id: uid(), name: questData.name, description: questData.description, difficulty: questData.difficulty, reward: questData.reward, location: questData.location, imgX: questData.imgX, imgY: questData.imgY, assignedTo: questData.assignedTo, status: 'active', completedBy: [], createdBy: currentUser.username, createdAt: new Date().toISOString() };
            state.quests.push(quest);
            addQuestMarker(quest);
            showToast('Quest criada! \u{1F4CC}');
        }
        saveState();
        renderQuestList();
        renderDashboard();
        document.getElementById('quest-modal').classList.remove('visible');
    });

    // ── Quest List ──
    function renderQuestList() {
        var list = document.getElementById('quest-list');
        var empty = document.getElementById('empty-quests');
        if (state.quests.length === 0) { list.innerHTML = ''; list.appendChild(empty); empty.style.display = 'block'; return; }

        empty.style.display = 'none';
        var diffLabels = { easy: 'F\u00e1cil', medium: 'M\u00e9dio', hard: 'Dif\u00edcil', hardcore: 'Hardcore' };
        var diffIcons = { easy: '\u{1F7E2}', medium: '\u{1F7E1}', hard: '\u{1F534}', hardcore: '\u{1F480}' };

        list.innerHTML = state.quests.map(function(q) {
            var isCompletedByMe = q.completedBy && q.completedBy.includes(currentUser.username);
            return '<div class="quest-card" data-id="' + q.id + '">' +
                '<div class="quest-title">' + (diffIcons[q.difficulty] || '\u{1F4CC}') + ' ' + q.name + '</div>' +
                (q.description ? '<div class="quest-desc">' + q.description + '</div>' : '') +
                '<div class="quest-meta">' +
                    '<span class="quest-badge ' + q.difficulty + '">' + (diffLabels[q.difficulty] || q.difficulty) + '</span>' +
                    '<span class="quest-badge ' + q.status + '">' + (q.status === 'active' ? 'Ativa' : 'Conclu\u00edda') + '</span>' +
                    (q.reward ? '<span style="font-size:0.7rem;color:var(--accent-yellow)">\u{1F3C6} ' + q.reward + '</span>' : '') +
                '</div>' +
                (q.assignedTo ? '<div class="quest-assigned">\u{1F464} Atribu\u00edda a: ' + q.assignedTo + '</div>' : '') +
                (q.completedBy && q.completedBy.length > 0 ? '<div class="quest-assigned" style="color:var(--accent-green)">\u2705 Completa: ' + q.completedBy.join(', ') + '</div>' : '') +
                '<div class="quest-actions">' +
                    (!isCompletedByMe && q.status === 'active' ? '<button class="btn btn-sm btn-primary" onclick="window.completeQuest(\'' + q.id + '\')">\u2705 Completar</button>' : '') +
                    '<button class="btn btn-sm btn-ghost" onclick="window.editQuest(\'' + q.id + '\')">\u270F\uFE0F</button>' +
                    '<button class="btn btn-sm btn-ghost" onclick="window.deleteQuest(\'' + q.id + '\')">\u{1F5D1}\uFE0F</button>' +
                    (q.imgX && q.imgY ? '<button class="btn btn-sm btn-ghost" onclick="window.flyToQuest(\'' + q.id + '\')" title="Ver no mapa">\u{1F50D}</button>' : '') +
                '</div></div>';
        }).join('');
    }

    window.completeQuest = function(questId) {
        var quest = state.quests.find(function(q) { return q.id === questId; });
        if (quest) {
            if (!quest.completedBy) quest.completedBy = [];
            if (!quest.completedBy.includes(currentUser.username)) quest.completedBy.push(currentUser.username);
            if (!quest.assignedTo || quest.completedBy.includes(quest.assignedTo)) quest.status = 'completed';
            saveState(); renderQuestList(); renderDashboard();
            removeQuestMarker(questId); addQuestMarker(quest);
            showToast('Quest "' + quest.name + '" conclu\u00edda! \u2705');
        }
    };

    window.editQuest = function(questId) {
        var quest = state.quests.find(function(q) { return q.id === questId; });
        if (quest) openQuestModal(quest.imgX, quest.imgY, quest, quest.location);
    };

    window.deleteQuest = function(questId) {
        if (confirm('Deletar esta quest?')) {
            state.quests = state.quests.filter(function(q) { return q.id !== questId; });
            removeQuestMarker(questId);
            saveState(); renderQuestList(); renderDashboard();
            showToast('Quest deletada', 'info');
        }
    };

    window.flyToQuest = function(questId) {
        var quest = state.quests.find(function(q) { return q.id === questId; });
        if (quest && quest.imgX && quest.imgY && pzMap && pzMap.viewport) {
            var viewportPoint = pzMap.viewport.imageToViewportCoordinates(
                new OpenSeadragon.Point(quest.imgX, quest.imgY)
            );
            pzMap.viewport.panTo(viewportPoint, false);
            pzMap.viewport.zoomTo(20, viewportPoint, false);
        }
    };

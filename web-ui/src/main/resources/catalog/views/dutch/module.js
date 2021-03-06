/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

(function() {

  goog.provide('gn_search_dutch');

  goog.require('cookie_warning');
  goog.require('gn_mdactions_directive');
  goog.require('gn_related_directive');
  goog.require('gn_search');
  goog.require('gn_gridrelated_directive');
  goog.require('gn_search_dutch_config');
  goog.require('gn_search_default_directive');
  goog.require('dutch_search_controller');
  goog.require('dutch_multi_location_directive');
  goog.require('dutch_pdok_load_controller');
  goog.require('gn_cors_interceptor');

  var module = angular.module('gn_search_dutch',
      ['gn_search', 'gn_search_dutch_config',
       'gn_search_default_directive', 'gn_related_directive',
       'cookie_warning', 'gn_mdactions_directive', 'gn_gridrelated_directive', 'dutch_search_controller',
       'dutch_multi_location_directive', 'dutch_search_home_controller',
       'dutch_pdok_load_controller',
       'gn_cors_interceptor']);


  module.filter('escape', function() {
    return window.encodeURIComponent;
  });

  module.controller('gnsSearchPopularController', [
    '$scope', 'gnSearchSettings',
    function($scope, gnSearchSettings) {
      $scope.searchObj = {
        permalink: false,
	internal: true,
        filters: gnSearchSettings.filters,
        params: {
          sortBy: 'popularity',
          from: 1,
          to: 12
        }
      };
    }]);


  module.controller('gnsSearchLatestController', [
    '$scope', 'gnSearchSettings',
    function($scope, gnSearchSettings) {
      $scope.searchObj = {
        permalink: false,
	internal: true,
        filters: gnSearchSettings.filters,
        params: {
          sortBy: 'changeDate',
          from: 1,
          to: 12
        }
      };
    }]);
module.controller('gnsSearchTopEntriesController', [
    '$scope', 'gnGlobalSettings',
    function($scope, gnGlobalSettings) {
      $scope.resultTemplate = '../../catalog/components/' +
        'search/resultsview/partials/viewtemplates/grid4maps.html';
      $scope.searchObj = {
        permalink: false,
	internal: true,
        filters: {
          'type': 'interactiveMap'
        },
        params: {
          sortBy: 'changeDate',
          from: 1,
          to: 30
        }
      };
    }]);
  module.controller('gnsDutch', [
    '$scope',
    '$location',
    '$filter',
    'suggestService',
    '$http',
    '$translate',
    'gnUtilityService',
    'gnSearchSettings',
    'gnViewerSettings',
    'gnMap',
    'gnMdView',
    'gnMdViewObj',
    'gnWmsQueue',
    'gnSearchLocation',
    'gnOwsContextService',
    'hotkeys',
    'gnGlobalSettings',
    'gnExternalViewer',
    function($scope, $location, $filter,
	     suggestService, $http, $translate,
             gnUtilityService, gnSearchSettings, gnViewerSettings,
             gnMap, gnMdView, mdView, gnWmsQueue,
             gnSearchLocation, gnOwsContextService,
             hotkeys, gnGlobalSettings, gnExternalViewer) {

      var viewerMap = gnSearchSettings.viewerMap;
      var searchMap = gnSearchSettings.searchMap;
      $scope.isFullScreenMap = true //Big size in page map
      
      $scope.modelOptions = angular.copy(gnGlobalSettings.modelOptions);
      $scope.modelOptionsForm = angular.copy(gnGlobalSettings.modelOptions);
      $scope.isFilterTagsDisplayedInSearch = gnGlobalSettings.gnCfg.mods.search.isFilterTagsDisplayedInSearch;
      $scope.gnWmsQueue = gnWmsQueue;
      $scope.$location = $location;
      $scope.activeTab = '/home';
      $scope.formatter = gnGlobalSettings.gnCfg.mods.search.formatter;
      $scope.currentTabMdView = 'relations';
      $scope.listOfResultTemplate = gnGlobalSettings.gnCfg.mods.search.resultViewTpls;
      $scope.resultTemplate = gnSearchSettings.resultTemplate;
      $scope.advandedSearchTemplate = gnSearchSettings.advancedSearchTemplate;
      $scope.facetsSummaryType = gnSearchSettings.facetsSummaryType;
      $scope.facetConfig = gnSearchSettings.facetConfig;
      $scope.facetTabField = gnSearchSettings.facetTabField;
      $scope.location = gnSearchLocation;
      $scope.fluidLayout = gnGlobalSettings.gnCfg.mods.home.fluidLayout;
      $scope.fluidEditorLayout = gnGlobalSettings.gnCfg.mods.editor.fluidEditorLayout;
      $scope.fluidHeaderLayout = gnGlobalSettings.gnCfg.mods.header.fluidHeaderLayout;
      $scope.showGNName = gnGlobalSettings.gnCfg.mods.header.showGNName;
      $scope.fixedMiniMap = false;
      $scope.fixedMiniMapFullSreen = true;
      $scope.toggleMaxSizeMap = false;  // big map for resultsPage
      $scope.extraWideContainer = false;      
      $scope.toggleMap = function () {
        $(searchMap.getTargetElement()).toggle();
        $('button.gn-minimap-toggle > i').toggleClass('fa-angle-double-left fa-angle-double-right');
      };
      hotkeys.bindTo($scope)
        .add({
            combo: 'h',
            description: $translate.instant('hotkeyHome'),
            callback: function(event) {
              $location.path('/home');
            }
          }).add({
            combo: 't',
            description: $translate.instant('hotkeyFocusToSearch'),
            callback: function(event) {
              event.preventDefault();
              var anyField = $('#gn-any-field');
              if (anyField) {
                gnUtilityService.scrollTo();
                $location.path('/search');
                anyField.focus();
              }
            }
          }).add({
            combo: 'enter',
            description: $translate.instant('hotkeySearchTheCatalog'),
            allowIn: 'INPUT',
            callback: function() {
              $location.search('tab=search');
            }
            //}).add({
            //  combo: 'r',
            //  description: $translate.instant('hotkeyResetSearch'),
            //  allowIn: 'INPUT',
            //  callback: function () {
            //    $scope.resetSearch();
            //  }
          }).add({
            combo: 'm',
            description: $translate.instant('hotkeyMap'),
            callback: function(event) {
              $location.path('/map');
            }
          });

      // add extra width
      if ($scope.extraWideContainer) {
        $('body').addClass("gn-extra-wide-container");
      }

      // TODO: Previous record should be stored on the client side
      $scope.mdView = mdView;
      gnMdView.initMdView();
      $scope.goToSearch = function (any) {
        $location.path('/search').search({'any': any});
      };

      // $scope.testClick = function() {
      //   console.log('test')
      //   let url = '{portal}/api/customstyle'
      //   $http.get(url).
      //   success(function(response) {
      //     console.log(response)
      //   })
      // }

      $scope.backToSearch = function() {
        gnSearchLocation.restoreSearch();
      };

      var updateSizeSearchMap = function() {
        setTimeout(function() {
          searchMap.updateSize();
        }, 300)
      };

      $scope.fixedMiniMapVisibl = function() {
        $scope.fixedMiniMap = !$scope.fixedMiniMap
        $('button.fixed-mini-map-visib-toggle > i').toggleClass('fa-angle-down fa-angle-up');
        updateSizeSearchMap();
        console.log("view")
      };

      $scope.fullScreenMap = function() {        
        $scope.isFullScreenMap = !$scope.isFullScreenMap;      
      };

      $scope.maxSizeMap = function() {         
        $('button.max-size-map-toggle > i').toggleClass('fa-expand fa-compress');
        updateSizeSearchMap();
        if(!$scope.fixedMiniMap){
          $scope.toggleMaxSizeMap = !$scope.toggleMaxSizeMap; 
        } else {
          $scope.fixedMiniMapFullSreen = !$scope.fixedMiniMapFullSreen
        } 
      }	

      $scope.canEdit = function(record) {
        // TODO: take catalog config for harvested records
        if (record && record['geonet:info'] &&
            record['geonet:info'].edit == 'true') {
          return true;
        }
        return false;
      };
      $scope.openRecord = function(index, md, records) {
        gnMdView.feedMd(index, md, records);
      };

      $scope.closeRecord = function() {
        gnMdView.removeLocationUuid();
        $location.search('tab', null);

      };
      $scope.nextRecord = function() {
        var nextRecordId = mdView.current.index + 1;
        if (nextRecordId === mdView.records.length) {
          // When last record of page reached, go to next page...
          // Not the most elegant way to do it, but it will
          // be easier using index search components
          $scope.$broadcast('nextPage');
        } else {
          $scope.openRecord(nextRecordId);
        }
      };
      $scope.previousRecord = function() {
        var prevRecordId = mdView.current.index - 1;
        if (prevRecordId === -1) {
          $scope.$broadcast('previousPage');
        } else {
          $scope.openRecord(prevRecordId);
        }
      };
      $scope.nextPage = function() {
        $scope.$broadcast('nextPage');
      };
      $scope.previousPage = function() {
        $scope.$broadcast('previousPage');
      };

       /**
       * Toggle the list types on the homepage
       * @param  {String} type Type of list selected
       */
      $scope.toggleListType = function(type) {
        $scope.type = type;
      };

      $scope.infoTabs = {
        lastRecords: {
          title: 'lastRecords',
          titleInfo: '',
          active: true
        },
        preferredRecords: {
          title: 'preferredRecords',
          titleInfo: '',
          active: false
        }};

      // Set the default browse mode for the home page
      $scope.$watch('searchInfo', function (n, o) {
        if (angular.isDefined($scope.searchInfo.facet)) {
          if ($scope.searchInfo.facet['topicCats'].length > 0) {
            $scope.browse = 'topics';
          } else if ($scope.searchInfo.facet['categories'].length > 0) {
           $scope.browse = '_cat';
          } else if ($scope.searchInfo.facet['types'].length > 0) {
            $scope.browse = 'type';
          }
        }
      });

      $scope.$on('layerAddedFromContext', function(e,l) {
        var md = l.get('md');
        if(md) {
          var linkGroup = md.getLinkGroup(l);
          gnMap.feedLayerWithRelated(l,linkGroup);
        }
      });

      $scope.resultviewFns = {
        addMdLayerToMap: function (link, md) {
          var config = {
             uuid: md?md.getUuid():null,
             type: link.protocol.indexOf('WMTS') > -1 ? 'wmts' : 'wms',
             url: $filter('gnLocalized')(link.url) || link.url
           };

          if (angular.isObject(link.title)) {
            link.title = $filter('gnLocalized')(link.title);
          }
          if (angular.isObject(link.name)) {
            link.name = $filter('gnLocalized')(link.name);
          }
 
          if (link.name && link.name !== '') {
            config.name = link.name;
            config.group = link.group;
            // Related service return a property title for the name
          } else if (link.title) {
            config.name = $filter('gnLocalized')(link.title) || link.title;
          }

          // if an external viewer is defined, use it here
          if (gnExternalViewer.isEnabled()) {
            gnExternalViewer.viewService({
              id: md ? md.getId() : null,
              uuid: config.uuid
            }, {
              type: config.type,
              url: config.url,
              name: config.name,
              title: link.title
            });
            return;
          }

          // This is probably only a service
          // Open the add service layer tab
          $location.path('map').search({
            add: encodeURIComponent(angular.toJson([config]))});
          return;
        },
        addAllMdLayersToMap: function (layers, md) {
          angular.forEach(layers, function (layer) {
            $scope.resultviewFns.addMdLayerToMap(layer, md);
          });
        },
        loadMap: function (map, md) {
          gnOwsContextService.loadContextFromUrl(map.url, viewerMap);
        }
      };

      // Share map loading functions
      gnViewerSettings.resultviewFns = $scope.resultviewFns;

      // Manage route at start and on $location change
      // depending on configuration
      if (!$location.path()) {
        var m = gnGlobalSettings.gnCfg.mods;
        $location.path(
          m.home.enabled ? '/home' :
          m.search.enabled ? '/search' :
          m.map.enabled ? '/map' : 'home'
        );
      }

      // Manage route at start and on $location change
      if (!$location.path()) {
        $location.path('/home');
      }
      var setActiveTab = function() {
        $scope.activeTab = $location.path().
        match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];
        if($scope.activeTab == '/search') {
          searchMap.updateSize();
        }
      };

      setActiveTab();
      $scope.$on('$locationChangeSuccess', setActiveTab);

      var sortConfig = gnSearchSettings.sortBy.split('#');      

      var availableTabs = ['general', 'contact', 'relations', 'catalog', 'inspire'];
      $scope.changeTabMdView =function(newTab) {
        if (availableTabs.indexOf(newTab) == -1) {
          newTab = availableTabs[0];
        }
        $location.search('tab', newTab);
      };

      // Event issued when the relations are not available.
      // Instead of using the requestedTab (fixed value) always, check if the user selected another tab.
      $scope.$on('tabChangeRequested', function(event, requestedTab) {
        var search = $location.search();

        if (angular.isDefined(search.tab) && (search.tab != 'relations')) {
          $scope.changeTabWithoutModifyingUrl(search.tab);
        } else {
          $scope.changeTabWithoutModifyingUrl(requestedTab);
        }
      });

      $scope.changeTabWithoutModifyingUrl = function (newTab) {
        if (newTab && availableTabs.indexOf(newTab) != -1) {
          $scope.currentTabMdView = newTab;
        } else {
          $scope.currentTabMdView = 'relations';
        }
      };

      $scope.$on('$locationChangeSuccess', function(next, current) {
        try {
        $scope.activeTab = $location.path().
            match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];
        } catch(e) {}
        var search = $location.search();

        if (search.tab && availableTabs.indexOf(search.tab) != -1) {
          $scope.currentTabMdView = search.tab;
        } else {
          $scope.currentTabMdView = 'relations';
        }

        if (gnSearchLocation.isSearch() && (!angular.isArray(
            searchMap.getSize()) || searchMap.getSize()[0] < 0)) {
          setTimeout(function() {
            searchMap.updateSize();

            // if an extent was obtained from a loaded context, apply it
            if(searchMap.get('lastExtent')) {
              searchMap.getView().fit(
                searchMap.get('lastExtent'),
                searchMap.getSize(), { nearest: true });
            }
          }, 0);
        }
        if (gnSearchLocation.isMap() && (!angular.isArray(
            viewerMap.getSize()) || viewerMap.getSize().indexOf(0) >= 0)) {
          setTimeout(function() {
            viewerMap.updateSize();

	    // if an extent was obtained from a loaded context, apply it
            if(viewerMap.get('lastExtent')) {
              viewerMap.getView().fit(
                viewerMap.get('lastExtent'),
                viewerMap.getSize(), { nearest: true });
            }

            var map = $location.search().map;
            if (angular.isDefined(map)) {
              $scope.resultviewFns.loadMap({url: map});
            }

          }, 0);
        }
      });

      angular.extend($scope.searchObj, {
        advancedMode: false,
        from: 1,
        to: 30,
        selectionBucket: 's101',
        viewerMap: viewerMap,
        searchMap: searchMap,
        mapfieldOption: {
          relations: ['within_bbox']
        },
        hitsperpageValues: gnSearchSettings.hitsperpageValues,
        filters: gnSearchSettings.filters,
        defaultParams: {
          'facet.q': '',
          resultType: gnSearchSettings.facetsSummaryType || 'details',
          sortBy: sortConfig[0] || 'relevance',
          sortOrder: sortConfig[1] || ''
        },
        params: {
          'facet.q': gnSearchSettings.defaultSearchString || '',
          resultType: gnSearchSettings.facetsSummaryType || 'details',
          sortBy: sortConfig[0] || 'relevance',
          sortOrder: sortConfig[1] || ''
        },
        sortbyValues: gnSearchSettings.sortbyValues
      });
    }]);
})();

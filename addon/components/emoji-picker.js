import Component from 'ember-component';
import computed from 'ember-computed';
import {htmlSafe} from 'ember-string';
import {throttle} from 'ember-runloop';
import layout from '../templates/components/emoji-picker';
import service from 'ember-service/inject';
import get from 'ember-metal/get';
import set from 'ember-metal/set';

import {A} from 'ember-array/utils';
import {default as EObject} from 'ember-object';
const  O = EObject.create.bind(EObject);

export default Component.extend({

  selectAction: undefined,



  emojiService: service('emoji'),



  layout,
  classNames: ['eeo-emojiPicker'],
  filterInput: '',



  scrollableId: computed(function () {
    return Math.random().toString(36).substr(2, 5);
  }),

  $scrollable: computed(function () {
    return this.$('.eeo-emojiPicker-scrollable');
  }),

  categorySections: computed('emojiService.categories', function () {
    const objs =
      this
        .get('emojiService.categories')
        .map(category => O({
          category,
          style: htmlSafe("")
        }));

    return A(objs);
  }),

  emojiByCategoryIdFiltered: computed(
    'filterInput',
    'emojiService.categories.@each.id',
    'emojiService.currentSkinToneEmoji__people',
    'emojiService.currentSkinToneEmoji__nature',
    'emojiService.currentSkinToneEmoji__food',
    'emojiService.currentSkinToneEmoji__activity',
    'emojiService.currentSkinToneEmoji__travel',
    'emojiService.currentSkinToneEmoji__objects',
    'emojiService.currentSkinToneEmoji__symbols',
    'emojiService.currentSkinToneEmoji__flags',
    function () {
      const filterInput = this.get('filterInput');
      const filterStrs  = filterInput.length ? filterInput.split(' ') : false;

      return this
        .get('emojiService.categories')
        .reduce((result, category) => {
          const categoryId      = category.get('id');
          const emojiPropName   = `emojiService.currentSkinToneEmoji__${categoryId}`;
          const emoji           = this.get(emojiPropName);

          emoji.forEach(emojo => {
            set(emojo, 'isVisible', filterStrs ? filterStrs.every(str => get(emojo, 'filterable').indexOf(str) > -1) : true);
          });

          result.set(categoryId, emoji);
          return result;
        }, O());
    }
  ),



  _applyFilterInput(filterInput) {
    this.setProperties({filterInput});
    this._updateScroll();
  },



  _updateScroll() {
    const $scrollable = this.get('$scrollable');
    const parHeight   = $scrollable.innerHeight();

    this
      .get('categorySections')
      .forEach(section => {
        const $category = this.$(`.eeo-emojiPicker-category._${section.category.get('id')} .eeo-emojiPicker-category-emoji`);

        if (!$category.length) {
          section.set('style', htmlSafe(''));
          return;
        }

        const catTop    = $category.position().top;
        const catHeight = $category.outerHeight();
        const catBottom = catTop + catHeight;
        const left      = (-catTop) / catHeight;
        const right     = (catBottom - parHeight) / catHeight;
        const style     = htmlSafe(`left: ${left  * 100}%; right: ${right * 100}%;`);

        section.setProperties({style});
      });
  },



  didInsertElement() {
    this._super(...arguments);

    this._updateScroll();

    this
      .$('.eeo-emojiPicker-scrollable')
      .on('scroll.eeo', () => throttle(this, this._updateScroll, 200, false));
  },



  willDestroyElement() {
    this._super(...arguments);

  },



  actions: {
    filter(filterInput) {
      throttle(this, this._applyFilterInput, filterInput, 400, false);
    }
  }
});

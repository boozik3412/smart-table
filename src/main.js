import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// API объект для работы с данными
const API = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);

  return {
    ...state,
    rowsPerPage,
    page,
  };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let query = {}; // здесь будут формироваться параметры запроса

  // Закомментированные apply* будут раскомментированы в следующих шагах:
  // query = applySearching(query, state, action);
  // query = applyFiltering(query, state, action);
  // query = applySorting(query, state, action);
  
  query = applyPagination(query, state, action); // ✅ Применяем пагинацию ПЕРЕД запросом

  const { total, items } = await API.getRecords(query);
  updatePagination(total, query); // ✅ Обновляем пагинатор ПОСЛЕ запроса
  sampleTable.render(items);
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render
);

// @todo: инициализация компонент
const { applyPagination, updatePagination } = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  }
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

// const applyFiltering = initFiltering(sampleTable.filter.elements, {
// searchBySeller: indexes.sellers
// });

const applySearching = initSearching("search");

// Асинхронная инициализация
async function init() {
  const indexes = await API.getIndexes();
  // Здесь позже добавим updateIndexes для фильтра
}

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);
init().then(render);

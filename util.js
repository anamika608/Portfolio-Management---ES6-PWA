function AddEventListener(element, event, callback) {
  element.addEventListener(event, callback);
}

function FetchFormValues(form) {
  const elements = Array.from(form.elements);
  return elements
    .filter(element => element.type !== "submit" && element.name)
    .reduce((values, element) => {
      values[element.name] = element.type === "checkbox"
        ? element.checked
        : element.value;
      return values;
    }, {});
}

export { AddEventListener, FetchFormValues };

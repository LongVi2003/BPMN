import {
  Errors,
  FormContext,
  Numberfield,
  Description,
  Label,
} from "@bpmn-io/form-js";
import { html, useContext } from "diagram-js/lib/ui";
import classNames from "classnames";


export class RangeField {
  constructor(formFields) {
    formFields.register("range", RangeRenderer);
  }
}

function RangeRenderer(props) {
  console.info("Range Renderer Props", props);

  //#region Constants
  const { disabled, errors = [], field, readonly, value } = props;
  const { description, range = {}, id, label } = field;
  const { min, max, step } = range;
  const { formId } = useContext(FormContext);
  const errorMessageId =
    errors.length === 0 ? undefined : `${prefixId(id, formId)}-error-message`;
  //#endregion

  //#region Events
  const onChange = ({ target }) => {
    console.log("Range event onChange", target);
    props.onChange({
      field,
      value: Number(target.value),
    });
  };
  //#endregion

  return html`<div class=${formFieldClasses("range")}>
    <${Label} id=${prefixId(id, formId)} label=${label} />
    <div class="range-group">
      <input
        type="range"
        disabled=${disabled}
        id=${prefixId(id, formId)}
        max=${max}
        min=${min}
        onInput=${onChange}
        readonly=${readonly}
        value=${value}
        step=${step}
      />
      <div class="range-value">${value}</div>
    </div>
    <${Description} description=${description} />
    <${Errors} errors=${errors} id=${errorMessageId} />
  </div>`;
}

//#region Configuration
/*
 * This is the configuration part of the custom field. It defines
 * the schema type, UI label and icon, palette group, properties panel entries
 * and much more.
 */
RangeRenderer.config = {
  /* we can extend the default configuration of existing fields */
  ...Numberfield.config,
  type: "range",
  label: "Range",
  propertiesPanelEntries: [
    "key",
    "label",
    "description",
    "min",
    "max",
    "disabled",
    "readonly",
  ],
};
//#endregion

//#region Functions
function formFieldClasses(
  type,
  { errors = [], disabled = false, readonly = false } = {}
) {
  if (!type) {
    throw new Error("type required");
  }

  return classNames("fjs-form-field", `fjs-form-field-${type}`, {
    "fjs-has-errors": errors.length > 0,
    "fjs-disabled": disabled,
    "fjs-readonly": readonly,
  });
}

function prefixId(id, formId) {
  if (formId) {
    return `fjs-form-${formId}-${id}`;
  }

  return `fjs-form-${id}`;
}
//#endregion

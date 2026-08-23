/**
 * Public surface of the forms family.
 *
 * FieldConfig is authored outside this family (pages/FormShowcase consumes
 * it directly; dev/form-builder builds editors around it), and FieldType is
 * its vocabulary type — exported alongside so the public config shape stays
 * fully nameable by consumers.
 *
 * Primitive control prop contracts (InputProps, SelectProps, ...) belong to
 * the components they describe and are re-exported by the primitives barrel;
 * they stay reachable here only through the ../types.ts deep path.
 *
 * This barrel only imports leaf modules — never another family barrel — to
 * keep the cross-family graph acyclic.
 */

export { default as FormField } from './FormField'
export type {
    FormFieldProps,
    FormFieldVariant,
    InputVariant,
    FieldType,
    FieldConfig,
} from './types'

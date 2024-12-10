export function camelCaseToNormal(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (match) {
      return match.toUpperCase();
    });
}

export function convertToNormalString(input) {
  if (input == null) {
    return '';  // Handle null/undefined cases
  }

  // Convert input to string if it is not already a string
  let result = typeof input === 'string' ? input : String(input);

  // Replace kebab-case (hyphen) with spaces, but ignore codes like TOD-400 or POD-12
  result = result.replace(/-(?!\d+)/g, ' ');

  // Handle PascalCase and camelCase by inserting spaces before capital letters, but skip all-caps codes
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Capitalize the first letter of the result
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}
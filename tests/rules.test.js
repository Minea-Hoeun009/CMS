const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Firestore Security Rules Static Analysis & Policy Checks', () => {

  const rulesContent = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');

  test('1. No open unauthenticated read or write rules exist', () => {
    assert.equal(rulesContent.includes('allow read, write: if true;'), false);
    assert.equal(rulesContent.includes('allow write: if true;'), false);
    assert.equal(rulesContent.includes('allow read: if true;'), false);
  });

  test('2. isSameSchool enforces strict school isolation without empty bypass', () => {
    // Must NOT contain the old vulnerable condition: getCurrentSchoolId() == '' || targetSchoolId == ''
    assert.equal(
      rulesContent.includes("getCurrentSchoolId() == '' || targetSchoolId == ''"),
      false,
      'isSameSchool must not allow bypass when school_id is empty'
    );

    // Must enforce non-empty check
    assert.equal(
      rulesContent.includes("getCurrentSchoolId() != '' &&"),
      true,
      'isSameSchool must check that user school_id is non-empty'
    );
    assert.equal(
      rulesContent.includes("targetSchoolId != '' &&"),
      true,
      'isSameSchool must check that target document school_id is non-empty'
    );
  });

  test('3. Audit logs collection is strictly append-only (immutable)', () => {
    const auditMatch = rulesContent.match(/match \/audit_logs\/\{logId\}\s*\{([\s\S]*?)\}/);
    assert.ok(auditMatch, 'audit_logs collection match must exist');

    const auditBlock = auditMatch[1];
    assert.ok(
      auditBlock.includes('allow update, delete: if false;') || 
      (auditBlock.includes('allow update: if false;') && auditBlock.includes('allow delete: if false;')),
      'Audit logs must strictly forbid update and delete'
    );
  });

  test('4. System settings collection restricts write to System Admin', () => {
    const settingsMatch = rulesContent.match(/match \/schools_config\/\{configId\}\s*\{([\s\S]*?)\}/);
    assert.ok(settingsMatch, 'schools_config collection match must exist');

    const settingsBlock = settingsMatch[1];
    assert.ok(
      settingsBlock.includes('isSystemAdmin()') || settingsBlock.includes('isSchoolAdmin()'),
      'Settings write must require administrative role'
    );
  });

});

import { TestHelper } from './testHelper';

describe('Collection', () => {
    const helper = new TestHelper();

    beforeAll(async () => {
        await helper.beforeAll();
    });

    afterAll(async () => {
        await helper.afterAll();
    });

    afterEach( async() => {
        await helper.afterEach();
    });

    it('global search should list only public collections for anonymous', async () => {
        const res = await helper.get('collections');
        const json = await res.json();

        expect(json).toEqual(expect.arrayContaining([
            helper.toOrgCollection(helper.viewOrg, helper.viewCollection), helper.toOrgCollection(helper.viewOrg, helper.editCollection)]));

        expect(json).toEqual(expect.not.arrayContaining([ helper.toOrgCollection(helper.viewOrg, helper.privateCollection) ]));
    });

    it('global search should list all collections for staff', async () => {
        const res = await helper.get('collections', helper.adminToken);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.arrayContaining([helper.toOrgCollection(helper.viewOrg, helper.viewCollection),
            helper.toOrgCollection(helper.viewOrg, helper.editCollection), helper.toOrgCollection(helper.viewOrg, helper.privateCollection)
        ]));
    });

    it('global should list public and belonging collections for authenticated members', async () => {
        const res = await helper.get('collections', helper.regularMemberUserToken);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.arrayContaining([
            helper.toOrgCollection(helper.viewOrg, helper.viewCollection), helper.toOrgCollection(helper.viewOrg, helper.editCollection),
            helper.toOrgCollection(helper.viewOrg, helper.privateCollection) ]));
    });

    it('global search should list only public collections for authenticated nonmember', async () => {
        const res = await helper.get('collections', helper.regularNonMemberUserToken);
        const json = await res.json();

        expect(json).toEqual(expect.arrayContaining([
            helper.toOrgCollection(helper.viewOrg, helper.viewCollection), helper.toOrgCollection(helper.viewOrg, helper.editCollection)]));

        expect(json).toEqual(expect.not.arrayContaining([ helper.toOrgCollection(helper.viewOrg, helper.privateCollection) ]));
    });

    it('global search with user param should list public collections of that user for anonymous', async () => {
        let collectionId = helper.newId('Collection');
        let collectionUrl = helper.joinUrl('users', helper.regularMemberUser, 'collections', collectionId);
        await helper.postUserCollection(helper.regularMemberUser, collectionId, helper.regularMemberUserToken, 'View');
        helper.cleanup(collectionUrl);

        const res = await helper.get('collections?user=' + helper.regularMemberUser);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.arrayContaining([helper.toUserCollection(helper.regularMemberUser, collectionId)]));
        expect(json).toHaveLength(1);
    });

    it('should list only public collections for anonymous', async () => {
        const res = await helper.get(helper.joinUrl(helper.viewOrgUrl, 'collections'));
        const json = await res.json();

        expect(json).toEqual(expect.arrayContaining([
            helper.toOrgCollection(helper.viewOrg, helper.viewCollection), helper.toOrgCollection(helper.viewOrg, helper.editCollection)]));

        expect(json).toEqual(expect.not.arrayContaining([ helper.toOrgCollection(helper.viewOrg, helper.privateCollection) ]));
    });

    it('should list all collections for staff', async () => {
        const res = await helper.get(helper.joinUrl(helper.viewOrgUrl, 'collections'), helper.adminToken);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.arrayContaining([helper.toOrgCollection(helper.viewOrg, helper.viewCollection),
            helper.toOrgCollection(helper.viewOrg, helper.editCollection), helper.toOrgCollection(helper.viewOrg, helper.privateCollection)
        ]));
    });

    it('should list public and belonging collections for authenticated member', async () => {
        const res = await helper.get(helper.joinUrl(helper.viewOrgUrl, 'collections'), helper.regularMemberUserToken);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.arrayContaining([
            helper.toOrgCollection(helper.viewOrg, helper.viewCollection), helper.toOrgCollection(helper.viewOrg, helper.editCollection),
            helper.toOrgCollection(helper.viewOrg, helper.privateCollection) ]));
    });

    it('should list public and belonging collections in all orgs for authenticated member', async () => {
        const res = await helper.get(helper.joinUrl(helper.regularMemberUserUrl, 'orgs', 'collections'), helper.regularMemberUserToken);
        const res2 = await helper.get(helper.joinUrl('user', 'orgs', 'collections'), helper.regularMemberUserToken);

        expect(res.status).toBe(200);
        expect(res2.status).toBe(200);

        const json = await res.json();
        const json2 = await res2.json();

        expect(json).toEqual(expect.arrayContaining([
            helper.toOrgCollection(helper.viewOrg, helper.viewCollection),
            helper.toOrgCollection(helper.viewOrg, helper.editCollection),
            helper.toOrgCollection(helper.viewOrg, helper.privateCollection),

            helper.toOrgCollection(helper.editOrg, helper.privateEditOrgOwnedCollection),
        ]));
        expect(json).toEqual(json2);
    });

    it('should list only public collections for authenticated nonmember', async () => {
        const res = await helper.get(helper.joinUrl(helper.viewOrgUrl, 'collections'), helper.regularNonMemberUserToken);
        const json = await res.json();

        expect(json).toEqual(expect.arrayContaining([
            helper.toOrgCollection(helper.viewOrg, helper.viewCollection), helper.toOrgCollection(helper.viewOrg, helper.editCollection)]));

        expect(json).toEqual(expect.not.arrayContaining([ helper.toOrgCollection(helper.viewOrg, helper.privateCollection) ]));
    });

    it('should list all collections belonging to an authenticated user', async () => {
        const res = await helper.get(helper.joinUrl(helper.regularNonMemberUserUrl, 'collections'), helper.regularNonMemberUserToken);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.arrayContaining([
            helper.toUserCollection(helper.regularNonMemberUser, helper.privateUserOwnedCollection),
            helper.toUserCollection(helper.regularNonMemberUser, helper.viewUserOwnedCollection) ]));
    });

    it('should list only public collections for anonymous user', async () => {
        const res = await helper.get(helper.joinUrl(helper.regularNonMemberUserUrl, 'collections'));

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.arrayContaining([
            helper.toUserCollection(helper.regularNonMemberUser, helper.viewUserOwnedCollection),
        ]));
        expect(json).toEqual(expect.not.arrayContaining([
            helper.toUserCollection(helper.regularNonMemberUser, helper.privateUserOwnedCollection),
        ]));
    });

    it('should not be created by anonymous', async () => {
        const collectionId = helper.newId('Collection');
        const res = await helper.postOrgCollection('OCL', collectionId, null);
        expect(res.status).toBe(403);

        const res2 = await helper.get('orgs/OCL/collections/', helper.adminToken);
        const json = await res2.json();

        expect(json).toEqual(expect.not.arrayContaining([ helper.toOrgCollection('OCL', collectionId) ]));
    });

    const updateCollectionTestHelper = async(updateToken: string, publicAccess?: string, success?: boolean) => {
        const collectionId = helper.newId('Collection')
        const collectionUrl = helper.joinUrl(helper.viewOrgUrl, 'collections', collectionId);
        await helper.postOrgCollection(helper.viewOrg, collectionId, helper.regularMemberUserToken, publicAccess);
        helper.cleanup(collectionUrl);

        const res2 = await helper.put(collectionUrl, {'name': 'test'}, updateToken);
        if (success == null || success) {
            expect(res2.status).toBe(200);
            const json = await res2.json();
            expect(json).toEqual(expect.objectContaining(helper.toOrgCollection(helper.viewOrg, collectionId, 'test')));
        } else {
            expect([403, 401]).toContain(res2.status);
            const json = await res2.json();
            expect(json).toEqual(expect.not.objectContaining(helper.toOrgCollection(helper.viewOrg, collectionId, 'test')));
        }
    };

    it('with none access should not be updated by anonymous', async () => {
        await updateCollectionTestHelper(null, 'None', false);
    });

    it('with view access should not be updated by anonymous', async () => {
        await updateCollectionTestHelper(null, 'View', false);
    });

    it('with edit access should not be updated by anonymous', async () => {
        await updateCollectionTestHelper(null, 'Edit', false);
    });

    it('should be updated by staff', async () => {
        await updateCollectionTestHelper(helper.adminToken);
    });

    it('with none access should be updated by staff', async () => {
        await updateCollectionTestHelper(helper.adminToken, 'None');
    });

    it('with view access should be updated by staff', async () => {
        await updateCollectionTestHelper(helper.adminToken, 'View');
    });

    it('with edit access should be updated by staff', async () => {
        await updateCollectionTestHelper(helper.adminToken, 'Edit');
    });

    it('should be updated by authenticated member', async () => {
        await updateCollectionTestHelper(helper.regularMemberUserToken);
    });

    it('with none access should be updated by authenticated member', async () => {
        await updateCollectionTestHelper(helper.regularMemberUserToken, 'None');
    });

    it('with view access should be updated by authenticated member', async () => {
        await updateCollectionTestHelper(helper.regularMemberUserToken, 'View');
    });

    it('with edit access should be updated by authenticated member', async () => {
        await updateCollectionTestHelper(helper.regularMemberUserToken, 'Edit');
    });

    it('should not be updated by authenticated nonmember', async () => {
        await updateCollectionTestHelper(helper.regularNonMemberUserToken, null, false);
    });

    it('with none access should not be updated by authenticated nonmember', async () => {
        await updateCollectionTestHelper(helper.regularNonMemberUserToken, 'None', false);
    });

    it('with view access should not be updated by authenticated nonmember', async () => {
        await updateCollectionTestHelper(helper.regularNonMemberUserToken, 'View', false);
    });

    it('with edit access should be updated by authenticated nonmember', async () => {
        await updateCollectionTestHelper(helper.regularNonMemberUserToken, 'Edit');
    });

    const deleteCollectionTestHelper = async (updateToken: string, publicAccess?: string, success?: boolean) => {
        const collectionId = helper.newId('Collection');
        const collectionUrl = helper.joinUrl(helper.viewOrgUrl, 'collections', collectionId);
        const res = await helper.postOrgCollection(helper.viewOrg, collectionId, helper.regularMemberUserToken, publicAccess);
        helper.cleanup(collectionUrl);

        const json = await res.json();
        expect(json).toEqual(expect.objectContaining(helper.toOrgCollection(helper.viewOrg, collectionId)));

        const res2 = await helper.del(collectionUrl, updateToken);
        if (success == null || success) {
            expect(res2.status).toBe(204);
        } else {
            expect([403, 401]).toContain(res2.status);
        }

        const res3 = await helper.get(helper.joinUrl(helper.viewOrgUrl, 'collections'), helper.adminToken);
        const json3 = await res3.json();
        if (success == null || success) {
            expect(json3).toEqual(expect.not.arrayContaining([helper.toOrgCollection(helper.viewOrg, collectionId)]));
        } else {
            expect(json3).toEqual(expect.arrayContaining([helper.toOrgCollection(helper.viewOrg, collectionId)]));
        }
    };

    it('with none access should not be deleted by anonymous', async () => {
        await deleteCollectionTestHelper(null, 'None', false);
    });

    it('with view access should not be deleted by anonymous', async () => {
        await deleteCollectionTestHelper(null, 'View', false);
    });

    it('with edit access should not be deleted by anonymous', async () => {
        await deleteCollectionTestHelper(null, 'Edit', false);
    });

    it('should be deleted by staff', async () => {
        await deleteCollectionTestHelper(helper.adminToken);
    });

    it('with none access should be deleted by staff', async () => {
        await deleteCollectionTestHelper(helper.adminToken, 'None');
    });

    it('with view access should be deleted by staff', async () => {
        await deleteCollectionTestHelper(helper.adminToken, 'View');
    });

    it('with edit access should be deleted by staff', async () => {
        await deleteCollectionTestHelper(helper.adminToken, 'Edit');
    });

    it('should be deleted by authenticated member', async () => {
        await deleteCollectionTestHelper(helper.regularMemberUserToken);
    });

    it('with none access should not be deleted by authenticated member', async () => {
        await deleteCollectionTestHelper(helper.regularMemberUserToken, 'None');
    });

    it('with view access should not be deleted by authenticated member', async () => {
        await deleteCollectionTestHelper(helper.regularMemberUserToken, 'View');
    });

    it('with edit access should not be deleted by authenticated member', async () => {
        await deleteCollectionTestHelper(helper.regularMemberUserToken, 'Edit');
    });

    it('should not be deleted by authenticated nonmember', async () => {
        await deleteCollectionTestHelper(helper.regularNonMemberUserToken, null, false);
    });

    it('with none access should not be deleted by authenticated nonmember', async () => {
        await deleteCollectionTestHelper(helper.regularNonMemberUserToken, 'None', false);
    });

    it('with view access should not be deleted by authenticated nonmember', async () => {
        await deleteCollectionTestHelper(helper.regularNonMemberUserToken, 'View', false);
    });

    it('with edit access should be deleted by authenticated nonmember', async () => {
        await deleteCollectionTestHelper(helper.regularNonMemberUserToken, 'Edit');
    });
});



order cred twoSum (tome<cred> nums, cred target) {
    holocron<cred, cred> comp = {};
    cred i = 0;
    force (i until nums.length) {
        should (comp[nums[i]] >= 0) {
            execute [comp[nums[i]], i]
        }
        comp[target-nums[i]] = i
    }
}
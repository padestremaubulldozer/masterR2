exports.seed = async function (knex) {
  await knex('sub_scores').del();
  await knex('lever_analyses').del();
  await knex('presentations').del();
  await knex('bps').del();

  await knex('bps').insert([
    { id: 1, name: 'Jordan',        role: 'Fondateur',        color: '#D4FF00', text_color: '#000', photo_url: 'https://media.licdn.com/dms/image/v2/D4D03AQHiOsHCMbDmmA/profile-displayphoto-shrink_800_800/B4DZUfIgeIHkAc-/0/1739984079211?e=1777507200&v=beta&t=gaJ2BLoTZH9XIFZiKbTlHSHazz4Cso452lxnjKGE11M' },
    { id: 2, name: 'Enguerrand',    role: 'Fondateur',        color: '#60A5FA', text_color: '#000', photo_url: 'https://media.licdn.com/dms/image/v2/D4E03AQETmOP0jjO2KA/profile-displayphoto-shrink_800_800/B4EZUfUHUuHcAc-/0/1739987124974?e=1777507200&v=beta&t=O7nSUnZlbv7vbeznBqSSM5kYT6BRDXFM3IeU66YcGVo' },
    { id: 3, name: 'Léo',           role: 'Business Partner', color: '#F97316', text_color: '#fff', photo_url: 'https://media.licdn.com/dms/image/v2/D4E03AQF_3ZMD7mdT6w/profile-displayphoto-shrink_800_800/B4EZVG_Yw8GwAc-/0/1740652776934?e=1777507200&v=beta&t=2BGOfJ_kA8RGUMaOfDLxQK92UKMFEqcMBrfE3N6Umwc' },
    { id: 4, name: 'Pierre-Arnaud', role: 'Business Partner', color: '#A78BFA', text_color: '#fff', photo_url: 'https://media.licdn.com/dms/image/v2/D5603AQEbkmn09Com0g/profile-displayphoto-crop_800_800/B56ZzEKW5aGQAI-/0/1772817576081?e=1777507200&v=beta&t=9VP6NDkbf76spDoF3FdE_IhBIs86p1_xgOiP-1c1hlw' },
  ]);
};

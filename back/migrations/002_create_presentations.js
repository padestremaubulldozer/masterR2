exports.up = function (knex) {
  return knex.schema.createTable('presentations', (t) => {
    t.increments('id').primary();
    t.string('num', 10).notNullable().unique();
    t.integer('bp_id').notNullable().references('id').inTable('bps');
    t.string('client_name', 200).notNullable();
    t.text('client_website_url');
    t.text('canva_url');
    t.text('claap_url');
    t.text('pre_audit_url');
    t.text('active_levers').notNullable().defaultTo('[]');
    t.string('pricing', 50);
    t.date('date_r1');
    t.date('date_r2');
    t.string('status', 20).notNullable().defaultTo('brouillon');
    t.text('context_entreprise');
    t.text('context_enjeux');
    t.text('context_challenges');
    t.integer('current_step').defaultTo(1);
    t.text('html_path');
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('presentations');
};

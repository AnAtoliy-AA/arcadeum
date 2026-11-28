'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useLanguage } from '@/shared/i18n';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';

import s from './GameCreateView.module.scss';
import f from './CreateFlow.module.scss';
import { SectionGroup } from './SectionGroup';
import { SelectedGameCard } from './SelectedGameCard';
import { GamePicker } from './GamePicker';
import { ThemePicker } from './ThemePicker';
import { ExpansionPacks } from './ExpansionPacks';
import { QuickPresets } from './QuickPresets';
import { RoomDetails } from './RoomDetails';
import { AdvancedOptions } from './AdvancedOptions';
import { CreateProgress } from './CreateProgress';
import { PreviewRail } from './PreviewRail';
import { GAMES } from './data/themes';
import { FLOW_STEPS } from './data/createFlow';
import { useCreateRoomForm } from './useCreateRoomForm';

/**
 * The create route is statically prerendered, so the server cannot know the
 * URL query (gameId/theme) or the stored session the form is seeded from.
 * Render the form only after hydration so its first client render matches the
 * server HTML (avoids React hydration error #418).
 */
export function GameCreateView() {
  const { isReady } = useLanguage();
  if (!isReady) {
    return <PageLoading layout="standard" />;
  }
  return <GameCreateForm />;
}

function GameCreateForm() {
  const { t } = useTranslation();
  const flow = useCreateRoomForm();
  const { form } = flow;
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerId = useId();
  const game = GAMES[form.gameId];
  const [stepGame, stepLook, stepRoom] = FLOW_STEPS;
  const showNameError = flow.nameTouched && flow.nameError;

  return (
    <PageLayout>
      <div className={s.page}>
        <Container size="lg">
          <div className={s.container}>
            <header className={`${s.head} ${s.fade}`}>
              <div>
                <span className={s.eyebrow}>
                  {t('createRoom.header.eyebrow')}
                </span>
                <h1>
                  <span className={s.srOnly}>{t('games.create.title')}</span>
                  <span aria-hidden="true">{t('createRoom.header.title')}</span>
                </h1>
                <p className={s.intro}>{t('createRoom.header.intro')}</p>
                <p className={f.quickNote}>{t('createRoom.header.quick')}</p>
              </div>
            </header>

            <CreateProgress roomReady={flow.isValid} />

            {flow.catalogFailed ? (
              <div
                className={f.notice}
                role="status"
                data-testid="catalog-error"
                style={{ marginBottom: 24 }}
              >
                <span className={f.noticeTitle}>
                  {t('createRoom.errors.catalogTitle')}
                </span>
                <span>{t('createRoom.errors.catalogHelp')}</span>
              </div>
            ) : null}

            <div className={s.grid}>
              <div className={`${s.colLeft} ${f.stack}`}>
                <SectionGroup
                  id={stepGame.anchor}
                  num="01"
                  title={t('createRoom.steps.game.title')}
                  why={t('createRoom.steps.game.why')}
                >
                  <SelectedGameCard
                    gameId={form.gameId}
                    themeId={form.themeId}
                    roomNumber={flow.hostRoomNumber}
                    pickerOpen={pickerOpen}
                    pickerId={pickerId}
                    onTogglePicker={() => setPickerOpen((v) => !v)}
                    onCycleTheme={flow.cycleTheme}
                  />
                  {pickerOpen ? (
                    <div className={f.pickerPanel} id={pickerId}>
                      <div className={f.pickerHead}>
                        <h3 className={f.pickerTitle}>
                          {t('createRoom.game.pickerTitle')}
                        </h3>
                      </div>
                      <p className={f.helper} style={{ marginBottom: 12 }}>
                        {t('createRoom.game.pickerHint')}
                      </p>
                      <GamePicker
                        value={form.gameId}
                        themeId={form.themeId}
                        comingSoon={flow.gameComingSoon}
                        onChange={(id) => {
                          flow.changeGame(id);
                          setPickerOpen(false);
                        }}
                      />
                    </div>
                  ) : null}
                </SectionGroup>

                <SectionGroup
                  id={stepLook.anchor}
                  num="02"
                  title={t('createRoom.steps.look.title')}
                  why={t('createRoom.steps.look.why')}
                >
                  <ThemePicker
                    gameId={form.gameId}
                    value={form.themeId}
                    label={t('createRoom.theme.groupLabel', {
                      game: game.title,
                    })}
                    onChange={flow.setTheme}
                  />
                  {game.hasExpansion ? (
                    <div style={{ marginTop: 28 }}>
                      <h3 className={f.subhead}>
                        {t('createRoom.steps.packs.title')}
                      </h3>
                      <p className={f.helper} style={{ marginBottom: 12 }}>
                        {t('createRoom.steps.packs.why')}
                      </p>
                      <ExpansionPacks
                        value={form.expansionPackIds}
                        onChange={flow.setPacks}
                      />
                    </div>
                  ) : null}
                </SectionGroup>

                <SectionGroup
                  id={stepRoom.anchor}
                  num="03"
                  title={t('createRoom.steps.room.title')}
                  why={t('createRoom.steps.room.why')}
                >
                  <div className={f.stack}>
                    <div>
                      <h3 className={f.subhead}>
                        {t('createRoom.steps.preset.title')}
                      </h3>
                      <p className={f.helper} style={{ marginBottom: 12 }}>
                        {t('createRoom.steps.preset.why')}
                      </p>
                      <QuickPresets
                        value={form.preset}
                        onChange={flow.applyPresetChoice}
                      />
                    </div>
                    <RoomDetails
                      gameId={form.gameId}
                      form={form}
                      nameError={showNameError ? flow.nameError : null}
                      onNameBlur={flow.markNameTouched}
                      onChange={flow.patchForm}
                    />
                    <AdvancedOptions
                      gameId={form.gameId}
                      form={form}
                      ruleComingSoon={flow.ruleComingSoon}
                      onChange={flow.patchForm}
                      onRulesChange={flow.setRules}
                    />
                  </div>
                </SectionGroup>
              </div>

              <PreviewRail
                form={form}
                defaultRoomName={flow.defaultRoomName}
                isValid={flow.isValid}
                loading={flow.loading}
                blocked={flow.blocked}
                error={flow.error}
                onSubmit={flow.submit}
                onThemeChange={flow.setTheme}
              />
            </div>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}

export default GameCreateView;

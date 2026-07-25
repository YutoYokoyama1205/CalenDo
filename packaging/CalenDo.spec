# -*- mode: python ; coding: utf-8 -*-
import sys


analysis = Analysis(
    ["../backend/app.py"],
    pathex=["../backend"],
    binaries=[],
    datas=[("../frontend/dist", "dist")],
    hiddenimports=["waitress"],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(analysis.pure)

if sys.platform == "darwin":
    exe = EXE(
        pyz,
        analysis.scripts,
        [],
        exclude_binaries=True,
        name="CalenDo",
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=False,
        console=False,
        disable_windowed_traceback=False,
        argv_emulation=False,
        target_arch=None,
        codesign_identity=None,
        entitlements_file=None,
    )
    collected = COLLECT(
        exe,
        analysis.binaries,
        analysis.datas,
        strip=False,
        upx=False,
        name="CalenDo",
    )
    app = BUNDLE(
        collected,
        name="CalenDo.app",
        bundle_identifier="jp.calendo.app",
        info_plist={
            "CFBundleName": "CalenDo",
            "CFBundleDisplayName": "CalenDo",
            "CFBundleShortVersionString": "1.0.0",
            "NSHighResolutionCapable": True,
        },
    )
else:
    exe = EXE(
        pyz,
        analysis.scripts,
        analysis.binaries,
        analysis.datas,
        [],
        name="CalenDo",
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=False,
        console=False,
        disable_windowed_traceback=False,
    )

// This file was generated by gir (https://github.com/gtk-rs/gir)
// from gir-files
// DO NOT EDIT

use crate::{ffi};
use glib::{prelude::*,translate::*};

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
#[derive(Clone, Copy)]
#[non_exhaustive]
#[doc(alias = "ZyppException")]
pub enum Exception {
    /// Error domain for the zypp exception handling. Errors in this domain will
    /// be from the [`Exception`][crate::Exception] enumeration. See [`glib::Error`][crate::glib::Error] for information
    /// on error domains.
    #[doc(alias = "ZYPP_ERROR")]
    Error,
#[doc(hidden)]
    __Unknown(i32),
}

impl Exception {
    #[doc(alias = "zypp_exception_quark")]
    pub fn quark() -> glib::Quark {
        assert_initialized_main_thread!();
        unsafe {
            from_glib(ffi::zypp_exception_quark())
        }
    }
}

#[doc(hidden)]
impl IntoGlib for Exception {
    type GlibType = ffi::ZyppException;

    #[inline]
fn into_glib(self) -> ffi::ZyppException {
match self {
            Self::Error => ffi::ZYPP_ERROR,
            Self::__Unknown(value) => value,
}
}
}

#[doc(hidden)]
impl FromGlib<ffi::ZyppException> for Exception {
    #[inline]
unsafe fn from_glib(value: ffi::ZyppException) -> Self {
        skip_assert_initialized!();
        
match value {
            ffi::ZYPP_ERROR => Self::Error,
            value => Self::__Unknown(value),
}
}
}

impl StaticType for Exception {
                #[inline]
    #[doc(alias = "zypp_exception_get_type")]
   fn static_type() -> glib::Type {
                    unsafe { from_glib(ffi::zypp_exception_get_type()) }
                }
            }

impl glib::HasParamSpec for Exception {
                type ParamSpec = glib::ParamSpecEnum;
                type SetValue = Self;
                type BuilderFn = fn(&str, Self) -> glib::ParamSpecEnumBuilder<Self>;
    
                fn param_spec_builder() -> Self::BuilderFn {
                    Self::ParamSpec::builder_with_default
                }
}

impl glib::value::ValueType for Exception {
    type Type = Self;
}

unsafe impl<'a> glib::value::FromValue<'a> for Exception {
    type Checker = glib::value::GenericValueTypeChecker<Self>;

    #[inline]
    unsafe fn from_value(value: &'a glib::Value) -> Self {
        skip_assert_initialized!();
        from_glib(glib::gobject_ffi::g_value_get_enum(value.to_glib_none().0))
    }
}

impl ToValue for Exception {
    #[inline]
    fn to_value(&self) -> glib::Value {
        let mut value = glib::Value::for_value_type::<Self>();
        unsafe {
            glib::gobject_ffi::g_value_set_enum(value.to_glib_none_mut().0, self.into_glib());
        }
        value
    }

    #[inline]
    fn value_type(&self) -> glib::Type {
        Self::static_type()
    }
}

impl From<Exception> for glib::Value {
    #[inline]
    fn from(v: Exception) -> Self {
        skip_assert_initialized!();
        ToValue::to_value(&v)
    }
}

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
#[derive(Clone, Copy)]
#[non_exhaustive]
#[doc(alias = "ZyppRepoInfoType")]
pub enum RepoInfoType {
    #[doc(alias = "ZYPP_REPO_NONE")]
    None,
    #[doc(alias = "ZYPP_REPO_RPMMD")]
    Rpmmd,
    #[doc(alias = "ZYPP_REPO_YAST2")]
    Yast2,
    #[doc(alias = "ZYPP_REPO_RPMPLAINDIR")]
    Rpmplaindir,
#[doc(hidden)]
    __Unknown(i32),
}

#[doc(hidden)]
impl IntoGlib for RepoInfoType {
    type GlibType = ffi::ZyppRepoInfoType;

    #[inline]
fn into_glib(self) -> ffi::ZyppRepoInfoType {
match self {
            Self::None => ffi::ZYPP_REPO_NONE,
            Self::Rpmmd => ffi::ZYPP_REPO_RPMMD,
            Self::Yast2 => ffi::ZYPP_REPO_YAST2,
            Self::Rpmplaindir => ffi::ZYPP_REPO_RPMPLAINDIR,
            Self::__Unknown(value) => value,
}
}
}

#[doc(hidden)]
impl FromGlib<ffi::ZyppRepoInfoType> for RepoInfoType {
    #[inline]
unsafe fn from_glib(value: ffi::ZyppRepoInfoType) -> Self {
        skip_assert_initialized!();
        
match value {
            ffi::ZYPP_REPO_NONE => Self::None,
            ffi::ZYPP_REPO_RPMMD => Self::Rpmmd,
            ffi::ZYPP_REPO_YAST2 => Self::Yast2,
            ffi::ZYPP_REPO_RPMPLAINDIR => Self::Rpmplaindir,
            value => Self::__Unknown(value),
}
}
}

impl StaticType for RepoInfoType {
                #[inline]
    #[doc(alias = "zypp_repo_info_type_get_type")]
   fn static_type() -> glib::Type {
                    unsafe { from_glib(ffi::zypp_repo_info_type_get_type()) }
                }
            }

impl glib::HasParamSpec for RepoInfoType {
                type ParamSpec = glib::ParamSpecEnum;
                type SetValue = Self;
                type BuilderFn = fn(&str, Self) -> glib::ParamSpecEnumBuilder<Self>;
    
                fn param_spec_builder() -> Self::BuilderFn {
                    Self::ParamSpec::builder_with_default
                }
}

impl glib::value::ValueType for RepoInfoType {
    type Type = Self;
}

unsafe impl<'a> glib::value::FromValue<'a> for RepoInfoType {
    type Checker = glib::value::GenericValueTypeChecker<Self>;

    #[inline]
    unsafe fn from_value(value: &'a glib::Value) -> Self {
        skip_assert_initialized!();
        from_glib(glib::gobject_ffi::g_value_get_enum(value.to_glib_none().0))
    }
}

impl ToValue for RepoInfoType {
    #[inline]
    fn to_value(&self) -> glib::Value {
        let mut value = glib::Value::for_value_type::<Self>();
        unsafe {
            glib::gobject_ffi::g_value_set_enum(value.to_glib_none_mut().0, self.into_glib());
        }
        value
    }

    #[inline]
    fn value_type(&self) -> glib::Type {
        Self::static_type()
    }
}

impl From<RepoInfoType> for glib::Value {
    #[inline]
    fn from(v: RepoInfoType) -> Self {
        skip_assert_initialized!();
        ToValue::to_value(&v)
    }
}

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
#[derive(Clone, Copy)]
#[non_exhaustive]
#[doc(alias = "ZyppRepoManagerError")]
pub enum RepoManagerError {
    #[doc(alias = "ZYPP_REPO_MANAGER_ERROR_REF_FAILED")]
    Failed,
    #[doc(alias = "ZYPP_REPO_MANAGER_ERROR_REF_SKIPPED")]
    Skipped,
    #[doc(alias = "ZYPP_REPO_MANAGER_ERROR_REF_ABORTED")]
    Aborted,
#[doc(hidden)]
    __Unknown(i32),
}

#[doc(hidden)]
impl IntoGlib for RepoManagerError {
    type GlibType = ffi::ZyppRepoManagerError;

    #[inline]
fn into_glib(self) -> ffi::ZyppRepoManagerError {
match self {
            Self::Failed => ffi::ZYPP_REPO_MANAGER_ERROR_REF_FAILED,
            Self::Skipped => ffi::ZYPP_REPO_MANAGER_ERROR_REF_SKIPPED,
            Self::Aborted => ffi::ZYPP_REPO_MANAGER_ERROR_REF_ABORTED,
            Self::__Unknown(value) => value,
}
}
}

#[doc(hidden)]
impl FromGlib<ffi::ZyppRepoManagerError> for RepoManagerError {
    #[inline]
unsafe fn from_glib(value: ffi::ZyppRepoManagerError) -> Self {
        skip_assert_initialized!();
        
match value {
            ffi::ZYPP_REPO_MANAGER_ERROR_REF_FAILED => Self::Failed,
            ffi::ZYPP_REPO_MANAGER_ERROR_REF_SKIPPED => Self::Skipped,
            ffi::ZYPP_REPO_MANAGER_ERROR_REF_ABORTED => Self::Aborted,
            value => Self::__Unknown(value),
}
}
}

impl glib::error::ErrorDomain for RepoManagerError {
    #[inline]
    fn domain() -> glib::Quark {
        skip_assert_initialized!();
        
        unsafe { from_glib(ffi::zypp_repo_manager_error_quark()) }
    }

    #[inline]
    fn code(self) -> i32 {
        self.into_glib()
    }

    #[inline]
    #[allow(clippy::match_single_binding)]
    fn from(code: i32) -> Option<Self> {
        skip_assert_initialized!();
        match unsafe { from_glib(code) } {
            Self::__Unknown(_) => Some(Self::Failed),
            value => Some(value),
}
    }
}

impl StaticType for RepoManagerError {
                #[inline]
    #[doc(alias = "zypp_repo_manager_error_get_type")]
   fn static_type() -> glib::Type {
                    unsafe { from_glib(ffi::zypp_repo_manager_error_get_type()) }
                }
            }

impl glib::HasParamSpec for RepoManagerError {
                type ParamSpec = glib::ParamSpecEnum;
                type SetValue = Self;
                type BuilderFn = fn(&str, Self) -> glib::ParamSpecEnumBuilder<Self>;
    
                fn param_spec_builder() -> Self::BuilderFn {
                    Self::ParamSpec::builder_with_default
                }
}

impl glib::value::ValueType for RepoManagerError {
    type Type = Self;
}

unsafe impl<'a> glib::value::FromValue<'a> for RepoManagerError {
    type Checker = glib::value::GenericValueTypeChecker<Self>;

    #[inline]
    unsafe fn from_value(value: &'a glib::Value) -> Self {
        skip_assert_initialized!();
        from_glib(glib::gobject_ffi::g_value_get_enum(value.to_glib_none().0))
    }
}

impl ToValue for RepoManagerError {
    #[inline]
    fn to_value(&self) -> glib::Value {
        let mut value = glib::Value::for_value_type::<Self>();
        unsafe {
            glib::gobject_ffi::g_value_set_enum(value.to_glib_none_mut().0, self.into_glib());
        }
        value
    }

    #[inline]
    fn value_type(&self) -> glib::Type {
        Self::static_type()
    }
}

impl From<RepoManagerError> for glib::Value {
    #[inline]
    fn from(v: RepoManagerError) -> Self {
        skip_assert_initialized!();
        ToValue::to_value(&v)
    }
}

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
#[derive(Clone, Copy)]
#[non_exhaustive]
#[doc(alias = "ZyppRepoRefreshResult")]
pub enum RepoRefreshResult {
    #[doc(alias = "ZYPP_REPO_MANAGER_UP_TO_DATE")]
    UpToDate,
    #[doc(alias = "ZYPP_REPO_MANAGER_REFRESHED")]
    Refreshed,
#[doc(hidden)]
    __Unknown(i32),
}

#[doc(hidden)]
impl IntoGlib for RepoRefreshResult {
    type GlibType = ffi::ZyppRepoRefreshResult;

    #[inline]
fn into_glib(self) -> ffi::ZyppRepoRefreshResult {
match self {
            Self::UpToDate => ffi::ZYPP_REPO_MANAGER_UP_TO_DATE,
            Self::Refreshed => ffi::ZYPP_REPO_MANAGER_REFRESHED,
            Self::__Unknown(value) => value,
}
}
}

#[doc(hidden)]
impl FromGlib<ffi::ZyppRepoRefreshResult> for RepoRefreshResult {
    #[inline]
unsafe fn from_glib(value: ffi::ZyppRepoRefreshResult) -> Self {
        skip_assert_initialized!();
        
match value {
            ffi::ZYPP_REPO_MANAGER_UP_TO_DATE => Self::UpToDate,
            ffi::ZYPP_REPO_MANAGER_REFRESHED => Self::Refreshed,
            value => Self::__Unknown(value),
}
}
}

impl StaticType for RepoRefreshResult {
                #[inline]
    #[doc(alias = "zypp_repo_refresh_result_get_type")]
   fn static_type() -> glib::Type {
                    unsafe { from_glib(ffi::zypp_repo_refresh_result_get_type()) }
                }
            }

impl glib::HasParamSpec for RepoRefreshResult {
                type ParamSpec = glib::ParamSpecEnum;
                type SetValue = Self;
                type BuilderFn = fn(&str, Self) -> glib::ParamSpecEnumBuilder<Self>;
    
                fn param_spec_builder() -> Self::BuilderFn {
                    Self::ParamSpec::builder_with_default
                }
}

impl glib::value::ValueType for RepoRefreshResult {
    type Type = Self;
}

unsafe impl<'a> glib::value::FromValue<'a> for RepoRefreshResult {
    type Checker = glib::value::GenericValueTypeChecker<Self>;

    #[inline]
    unsafe fn from_value(value: &'a glib::Value) -> Self {
        skip_assert_initialized!();
        from_glib(glib::gobject_ffi::g_value_get_enum(value.to_glib_none().0))
    }
}

impl ToValue for RepoRefreshResult {
    #[inline]
    fn to_value(&self) -> glib::Value {
        let mut value = glib::Value::for_value_type::<Self>();
        unsafe {
            glib::gobject_ffi::g_value_set_enum(value.to_glib_none_mut().0, self.into_glib());
        }
        value
    }

    #[inline]
    fn value_type(&self) -> glib::Type {
        Self::static_type()
    }
}

impl From<RepoRefreshResult> for glib::Value {
    #[inline]
    fn from(v: RepoRefreshResult) -> Self {
        skip_assert_initialized!();
        ToValue::to_value(&v)
    }
}

